import {TestRunner} from './TestRunner.js';

try {process.exitCode=new TestRunner().run();}
catch(error) {console.error(error.message);process.exitCode=1;}
