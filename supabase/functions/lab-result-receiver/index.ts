import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-analyzer-id, x-api-key',
};

interface LabResult {
  testCode: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: string;
  status: string;
}

interface ParsedMessage {
  messageType: 'HL7' | 'ASTM';
  patientId: string;
  patientName?: string;
  orderNumber: string;
  results: LabResult[];
  timestamp: string;
  sendingApplication?: string;
  messageId?: string;
}

// Parse HL7 v2.x ORU^R01 message
function parseHL7Message(message: string): ParsedMessage {
  const segments = message.split(/[\r\n]+/).filter(s => s.trim());
  const parsed: ParsedMessage = {
    messageType: 'HL7',
    patientId: '',
    orderNumber: '',
    results: [],
    timestamp: new Date().toISOString(),
  };

  for (const segment of segments) {
    const fields = segment.split('|');
    const segmentType = fields[0];

    switch (segmentType) {
      case 'MSH':
        // MSH|^~\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|DateTime||MessageType|MessageId|ProcessingId|Version
        parsed.sendingApplication = fields[2] || '';
        parsed.messageId = fields[9] || '';
        if (fields[6]) {
          // Parse HL7 timestamp format: YYYYMMDDHHMMSS
          const ts = fields[6];
          if (ts.length >= 8) {
            const year = ts.substring(0, 4);
            const month = ts.substring(4, 6);
            const day = ts.substring(6, 8);
            const hour = ts.length >= 10 ? ts.substring(8, 10) : '00';
            const min = ts.length >= 12 ? ts.substring(10, 12) : '00';
            const sec = ts.length >= 14 ? ts.substring(12, 14) : '00';
            parsed.timestamp = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
          }
        }
        break;

      case 'PID':
        // PID|SetID|ExternalID|InternalID^^^AssigningAuth^IDType|AltID|Name^Name2||DOB|Sex
        // Extract patient ID from field 3 (internal ID)
        const pidField3 = fields[3] || '';
        const pidParts = pidField3.split('^');
        parsed.patientId = pidParts[0] || '';
        
        // Extract patient name from field 5
        if (fields[5]) {
          const nameParts = fields[5].split('^');
          parsed.patientName = `${nameParts[1] || ''} ${nameParts[0] || ''}`.trim();
        }
        break;

      case 'OBR':
        // OBR|SetID|PlacerOrderNum|FillerOrderNum|TestCode^TestName
        parsed.orderNumber = fields[2] || fields[3] || '';
        break;

      case 'OBX':
        // OBX|SetID|ValueType|ObservationID^ObservationName|SubID|Value|Units|ReferenceRange|AbnormalFlag|Probability|Nature|Status
        const testCodeField = fields[3] || '';
        const testCodeParts = testCodeField.split('^');
        
        const result: LabResult = {
          testCode: testCodeParts[0] || '',
          testName: testCodeParts[1] || testCodeParts[0] || '',
          value: fields[5] || '',
          unit: fields[6] || '',
          referenceRange: fields[7] || '',
          flag: fields[8] || 'N', // N=Normal, H=High, L=Low, A=Abnormal
          status: fields[11] || 'F', // F=Final, P=Preliminary
        };
        
        if (result.testCode && result.value) {
          parsed.results.push(result);
        }
        break;
    }
  }

  return parsed;
}

// Parse ASTM/LIS2-A2 message
function parseASTMMessage(message: string): ParsedMessage {
  // ASTM uses different frame characters, commonly STX (0x02) and ETX (0x03)
  // Clean the message first
  const cleanMessage = message
    .replace(/[\x02\x03\x04\x05\x06\x15\x17]/g, '') // Remove control characters
    .replace(/\r\n/g, '\n');
  
  const lines = cleanMessage.split('\n').filter(s => s.trim());
  const parsed: ParsedMessage = {
    messageType: 'ASTM',
    patientId: '',
    orderNumber: '',
    results: [],
    timestamp: new Date().toISOString(),
  };

  for (const line of lines) {
    // ASTM uses | as field separator and ^ as component separator
    const recordType = line.charAt(0);
    const fields = line.substring(2).split('|'); // Skip record type and delimiter

    switch (recordType) {
      case 'H': // Header
        // H|\^&|||Analyzer^Version|||||||P|1|DateTime
        parsed.sendingApplication = fields[2]?.split('^')[0] || '';
        const hTimestamp = fields[10] || '';
        if (hTimestamp.length >= 8) {
          parsed.timestamp = parseASTMTimestamp(hTimestamp);
        }
        break;

      case 'P': // Patient
        // P|SeqNum|PracticeAssignedPatientID|LabAssignedPatientID|...
        parsed.patientId = fields[1] || fields[2] || '';
        break;

      case 'O': // Order
        // O|SeqNum|SpecimenID|InstrumentSpecimenID|UniversalTestID
        parsed.orderNumber = fields[1] || fields[2] || '';
        break;

      case 'R': // Result
        // R|SeqNum|UniversalTestID|DataValue|Units|ReferenceRanges|AbnormalFlag|...
        const testIdField = fields[1] || '';
        const testIdParts = testIdField.split('^');
        
        // ASTM test ID format: ^^^TestCode^TestName
        let testCode = '';
        let testName = '';
        if (testIdParts.length >= 4) {
          testCode = testIdParts[3] || '';
          testName = testIdParts[4] || testCode;
        } else {
          testCode = testIdParts[0] || '';
          testName = testIdParts[1] || testCode;
        }

        const result: LabResult = {
          testCode,
          testName,
          value: fields[2] || '',
          unit: fields[3] || '',
          referenceRange: fields[4] || '',
          flag: fields[5] || 'N',
          status: fields[7] || 'F',
        };
        
        if (result.testCode && result.value) {
          parsed.results.push(result);
        }
        break;
    }
  }

  return parsed;
}

function parseASTMTimestamp(ts: string): string {
  // ASTM timestamp format: YYYYMMDDHHMMSS
  if (ts.length >= 8) {
    const year = ts.substring(0, 4);
    const month = ts.substring(4, 6);
    const day = ts.substring(6, 8);
    const hour = ts.length >= 10 ? ts.substring(8, 10) : '00';
    const min = ts.length >= 12 ? ts.substring(10, 12) : '00';
    const sec = ts.length >= 14 ? ts.substring(12, 14) : '00';
    return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
  }
  return new Date().toISOString();
}

// Detect message format
function detectMessageFormat(message: string): 'HL7' | 'ASTM' | 'UNKNOWN' {
  const trimmed = message.trim();
  
  // HL7 messages start with MSH segment
  if (trimmed.startsWith('MSH|') || trimmed.includes('\nMSH|') || trimmed.includes('\rMSH|')) {
    return 'HL7';
  }
  
  // ASTM messages start with H| or contain STX character (0x02)
  if (trimmed.startsWith('H|') || trimmed.includes('\x02H|') || trimmed.charAt(0) === '\x02') {
    return 'ASTM';
  }
  
  // Check for H record anywhere (sometimes wrapped in frame characters)
  if (/^[\x02\x05]?H\|/.test(trimmed)) {
    return 'ASTM';
  }
  
  return 'UNKNOWN';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get analyzer ID from header (optional)
    const analyzerId = req.headers.get('x-analyzer-id');
    const apiKey = req.headers.get('x-api-key');

    // Parse request body
    const contentType = req.headers.get('content-type') || '';
    let rawMessage: string;

    if (contentType.includes('application/json')) {
      const json = await req.json();
      rawMessage = json.message || json.data || JSON.stringify(json);
    } else {
      rawMessage = await req.text();
    }

    if (!rawMessage || rawMessage.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Empty message received' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received message:', rawMessage.substring(0, 500));

    // Detect message format
    const messageFormat = detectMessageFormat(rawMessage);
    
    if (messageFormat === 'UNKNOWN') {
      // Log the unknown message for troubleshooting
      console.error('Unknown message format:', rawMessage.substring(0, 200));
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unknown message format. Expected HL7 or ASTM.',
          hint: 'HL7 messages should start with MSH|, ASTM messages should start with H|'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the message
    let parsed: ParsedMessage;
    try {
      if (messageFormat === 'HL7') {
        parsed = parseHL7Message(rawMessage);
      } else {
        parsed = parseASTMMessage(rawMessage);
      }
    } catch (parseError: unknown) {
      console.error('Parse error:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to parse message',
          details: errorMessage 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsed message:', JSON.stringify(parsed, null, 2));

    // Validate parsed data
    if (!parsed.patientId && !parsed.orderNumber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No patient ID or order number found in message' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (parsed.results.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No test results found in message' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to find the patient by MRN
    let matchedPatientId: string | null = null;
    let matchedOrderId: string | null = null;
    let organizationId: string | null = null;

    // First, try to get organization from analyzer
    if (analyzerId) {
      const { data: analyzer } = await supabase
        .from('lab_analyzers')
        .select('organization_id')
        .eq('id', analyzerId)
        .single();
      
      if (analyzer) {
        organizationId = analyzer.organization_id;
      }
    }

    // Try to find patient by MRN
    if (parsed.patientId) {
      const patientQuery = supabase
        .from('patients')
        .select('id, organization_id')
        .eq('mrn', parsed.patientId);
      
      if (organizationId) {
        patientQuery.eq('organization_id', organizationId);
      }
      
      const { data: patient } = await patientQuery.limit(1).single();
      
      if (patient) {
        matchedPatientId = patient.id;
        organizationId = organizationId || patient.organization_id;
      }
    }

    // Try to find order by order number
    if (parsed.orderNumber) {
      const orderQuery = supabase
        .from('lab_orders')
        .select('id, patient_id, branch_id')
        .eq('order_number', parsed.orderNumber);
      
      const { data: order } = await orderQuery.limit(1).single();
      
      if (order) {
        matchedOrderId = order.id;
        if (!matchedPatientId) {
          matchedPatientId = order.patient_id;
        }
      }
    }

    // If still no organization, we need one for logging
    if (!organizationId && matchedPatientId) {
      const { data: patient } = await supabase
        .from('patients')
        .select('organization_id')
        .eq('id', matchedPatientId)
        .single();
      
      if (patient) {
        organizationId = patient.organization_id;
      }
    }

    // Default organization if none found (use the first one for logging purposes)
    if (!organizationId) {
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();
      
      organizationId = orgs?.id;
    }

    if (!organizationId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not determine organization for this message' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine status
    let status: 'pending' | 'matched' | 'imported' | 'error' = 'pending';
    let errorMessage: string | null = null;
    let processedAt: string | null = null;

    if (matchedPatientId && matchedOrderId) {
      // Try to import results
      try {
        const importResults = await importLabResults(
          supabase,
          matchedOrderId,
          parsed.results,
          analyzerId
        );
        
        if (importResults.success) {
          status = 'imported';
          processedAt = new Date().toISOString();
        } else {
          status = 'matched';
          errorMessage = importResults.error || null;
        }
      } catch (importError: unknown) {
        status = 'matched';
        errorMessage = importError instanceof Error ? importError.message : 'Import failed';
      }
    } else if (matchedPatientId) {
      status = 'matched';
      errorMessage = 'Patient found but no matching order';
    } else {
      status = 'pending';
      errorMessage = 'No matching patient found';
    }

    // Log the import
    const { data: importLog, error: logError } = await supabase
      .from('lab_result_imports')
      .insert({
        organization_id: organizationId,
        analyzer_id: analyzerId,
        message_type: parsed.messageType,
        raw_message: rawMessage,
        parsed_data: parsed,
        patient_id_from_message: parsed.patientId,
        matched_patient_id: matchedPatientId,
        matched_order_id: matchedOrderId,
        status,
        error_message: errorMessage,
        processed_at: processedAt,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging import:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        importId: importLog?.id,
        patientMatched: !!matchedPatientId,
        orderMatched: !!matchedOrderId,
        resultsCount: parsed.results.length,
        message: status === 'imported' 
          ? `Successfully imported ${parsed.results.length} result(s)`
          : status === 'matched'
          ? 'Message matched but results not imported: ' + errorMessage
          : 'Message logged for manual review',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing lab result:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Import results into lab_order_items
async function importLabResults(
  supabase: any,
  orderId: string,
  results: LabResult[],
  analyzerId: string | null
): Promise<{ success: boolean; error?: string; updated: number }> {
  let updated = 0;

  // Get order items
  const { data: orderItems, error: itemsError } = await supabase
    .from('lab_order_items')
    .select('id, test_name, result_value, status, service_type_id')
    .eq('lab_order_id', orderId);

  if (itemsError) {
    return { success: false, error: itemsError.message, updated: 0 };
  }

  if (!orderItems || orderItems.length === 0) {
    return { success: false, error: 'No order items found', updated: 0 };
  }

  // Get analyzer test mappings if analyzer is specified
  let testMappings: Record<string, string> = {};
  if (analyzerId) {
    const { data: mappings } = await supabase
      .from('lab_analyzer_test_mappings')
      .select('analyzer_test_code, lab_test_template_id, lab_test_templates(name)')
      .eq('analyzer_id', analyzerId);
    
    if (mappings) {
      for (const mapping of mappings) {
        testMappings[mapping.analyzer_test_code.toLowerCase()] = mapping.lab_test_template_id;
      }
    }
  }

  // Match and update results
  for (const result of results) {
    const testCodeLower = result.testCode.toLowerCase();
    const testNameLower = result.testName.toLowerCase();
    
    // Find matching order item
    let matchedItem = orderItems.find((item: any) => {
      const itemNameLower = item.test_name?.toLowerCase() || '';
      
      // Check if test code matches a mapping
      if (testMappings[testCodeLower]) {
        // Match by template ID
        return item.service_type_id === testMappings[testCodeLower];
      }
      
      // Fallback: fuzzy match by test name
      return itemNameLower.includes(testCodeLower) || 
             itemNameLower.includes(testNameLower) ||
             testNameLower.includes(itemNameLower);
    });

    if (matchedItem && !matchedItem.result_value) {
      // Update the order item with the result
      const { error: updateError } = await supabase
        .from('lab_order_items')
        .update({
          result_value: result.value,
          result_unit: result.unit,
          reference_range: result.referenceRange,
          is_abnormal: result.flag !== 'N' && result.flag !== '',
          status: result.status === 'F' ? 'completed' : 'in_progress',
          result_entered_at: new Date().toISOString(),
        })
        .eq('id', matchedItem.id);

      if (!updateError) {
        updated++;
        // Mark as updated to prevent duplicate updates
        matchedItem.result_value = result.value;
      }
    }
  }

  // Update order status if all items have results
  const { data: updatedItems } = await supabase
    .from('lab_order_items')
    .select('status')
    .eq('lab_order_id', orderId);

  const allCompleted = updatedItems?.every((item: any) => item.status === 'completed');
  
  if (allCompleted) {
    await supabase
      .from('lab_orders')
      .update({ status: 'completed' })
      .eq('id', orderId);
  } else if (updated > 0) {
    await supabase
      .from('lab_orders')
      .update({ status: 'in_progress' })
      .eq('id', orderId);
  }

  return { 
    success: updated > 0, 
    updated,
    error: updated === 0 ? 'No matching tests found to update' : undefined
  };
}
