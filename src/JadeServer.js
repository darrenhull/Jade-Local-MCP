import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {tools,capabilities} from './tools.js';
import {guidanceUri,serverInstructions,readJadeGuidance} from './JadeGuidance.js';

/** Official MCP SDK owns transport, validation, negotiation and cancellation. */
export class JadeServer {
  constructor({operations,workspace,version='0.2.0'}) {
    this.server=new McpServer({name:'jade-mcp-server',version},{instructions:serverInstructions});
    this.server.registerTool('jade_get_guidance',{
      title:'Jade development guidance',description:'Read the bundled Jade development skill before compile/test, inspection, source editing or recovery troubleshooting. Explains Source/Working, native errors, VS Code formatting and actual feature limits. Does not open a database.',
      inputSchema:z.object({}).strict(),outputSchema:z.object({code:z.number(),passed:z.boolean(),uri:z.string(),skill:z.string()}),
      annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}
    },async()=>{const result={code:0,passed:true,uri:guidanceUri,skill:readJadeGuidance()};return {content:[{type:'text',text:result.skill}],structuredContent:result,isError:false};});
    this.server.registerResource('jade-development',guidanceUri,{description:'Bundled Jade development skill: native workflows, Source/Working, diagnostics, formatting, recovery and supported limits.',mimeType:'text/markdown'},async uri=>({contents:[{uri:uri.href,mimeType:'text/markdown',text:readJadeGuidance()}]}));
    for(const tool of tools())this.server.registerTool(tool.name,{
      title:tool.name.replaceAll('_',' '),description:tool.description,inputSchema:tool.inputSchema,outputSchema:z.record(z.string(),z.unknown()),
      annotations:{readOnlyHint:!tool.write,destructiveHint:!!tool.destructive,idempotentHint:tool.repeatable!==false,openWorldHint:false}
    },async(input,context)=>{
      const result=await operations.execute(tool.command,input,context);
      return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result,isError:result.passed===false};
    });
    this.server.registerResource('capabilities','jade://capabilities',{description:'Implemented Jade MCP capabilities and explicit limits.',mimeType:'application/json'},async uri=>({contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(capabilities)}]}));
    this.server.registerResource('workspace','jade://workspace',{description:'Resolved non-secret workspace identity and saved-file policy.',mimeType:'application/json'},async uri=>({contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(await workspace.describe(request=>operations.invoke(request)))}]}));
    this.server.registerPrompt('jade_check_changes',{description:'Compile saved Jade changes and run selected tests without publishing.',argsSchema:z.object({testFile:z.string().optional()})},async({testFile})=>({messages:[{role:'user',content:{type:'text',text:'Read jade_get_guidance first. Use jade_build to compile saved workspace changes. Report native diagnostics. '+(testFile?'Then use jade_test for '+testFile+'. ':'Use jade_list_tests to select relevant tests. ')+'Do not publish or modify the Source database. Summarise individual test failures.'}}]}));
  }
}
