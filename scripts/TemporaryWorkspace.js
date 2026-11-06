import fs from 'node:fs';

/** Removes an owned test fixture after its processes have been closed. */
export class TemporaryWorkspace {
  static remove(root){fs.rmSync(root,{recursive:true,force:true,maxRetries:20,retryDelay:50});}
}
