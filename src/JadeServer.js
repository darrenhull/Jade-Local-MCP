import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {tools,capabilities} from './tools.js';

/** Official MCP SDK owns transport, validation, negotiation and cancellation. */
export class JadeServer {
  constructor({operations,workspace,version='0.1.0'}) {
    this.server=new McpServer({name:'jade-mcp-server',version},{instructions:'Use Jade native tools against saved workspace files. Build and test use the isolated Working database. Database inspection is read-only. Schema-qualified class names and database-specific OIDs must retain their target identity. Publication, extraction and DAP are not exposed by this MCP server.'});
    for(const tool of tools())this.server.registerTool(tool.name,{
      title:tool.name.replaceAll('_',' '),description:tool.description,inputSchema:tool.inputSchema,outputSchema:z.record(z.string(),z.unknown()),
      annotations:{readOnlyHint:!tool.write,destructiveHint:!!tool.destructive,idempotentHint:tool.repeatable!==false,openWorldHint:false}
    },async(input,context)=>{
      const result=await operations.execute(tool.command,input,context);
      return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result,isError:result.passed===false};
    });
    this.server.registerResource('capabilities','jade://capabilities',{description:'Implemented Jade MCP capabilities and explicit limits.',mimeType:'application/json'},async uri=>({contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(capabilities)}]}));
    this.server.registerResource('workspace','jade://workspace',{description:'Resolved non-secret workspace identity and saved-file policy.',mimeType:'application/json'},async uri=>({contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(workspace.describe())}]}));
    this.server.registerPrompt('jade_check_changes',{description:'Compile saved Jade changes and run selected tests without publishing.',argsSchema:z.object({testFile:z.string().optional()})},async({testFile})=>({messages:[{role:'user',content:{type:'text',text:'Use jade_build to compile saved workspace changes. Report native diagnostics. '+(testFile?'Then use jade_test for '+testFile+'. ':'Use jade_list_tests to select relevant tests. ')+'Do not publish or modify the Source database. Summarise individual test failures.'}}]}));
  }
}
