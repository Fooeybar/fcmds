
function clrF(int=0,escape='\x1b'){
    let ret=escape;
    if(0<=int&&int<256)ret+=`[38;5;${int}m`;
    else ret+='[0m';
    return ret;
};

const CONFIG={
    title:'fcmds'
   ,escape:'\x1b'
   ,prompt_tag:'~>'
   ,prompt_color:46
   ,text_color:15
   ,cmd_color:14
   ,param_color:13
   ,err_color:9
   ,about_color:7
   ,on_exit:(code=0)=>{}
};

const CMD={
    name:''
    ,about:''
    ,params:[]
    ,func:()=>{}
};

let init=true;

function fcmds(config=CONFIG,cmd1=CMD,cmd2=CMD,cmd3=CMD){

    if(init===false)return config;

    //———Init—————————————————————————————————
    init=false;

    for(let c in CONFIG){
        if(config[c]===undefined||typeof(config[c])!==typeof(CONFIG[c]))
            config[c]=CONFIG[c];
    }

    const format_error=(cmd='',msg='',err_var='')=>{
        let out=clrF(config.err_color)+'*** ';
        out+=clrF(config.cmd_color)+cmd;
        out+=clrF(config.text_color)+'(';
        if(cmd.length>0&&CMDS[cmd]!==undefined)out+=clrF(config.param_color)+CMDS[cmd].params.join(' ');
        out+=clrF(config.text_color)+')';
        out+=clrF(config.prompt_color)+' : ';
        out+=clrF(config.err_color)+msg;
        out+=clrF(config.prompt_color)+' : ';
        out+=clrF(config.param_color)+err_var;
        return out;
    };

    //write title to terminal.
    process.stdout.write(config.escape+'[?25l'+config.escape+'[30m\033]0;'+config.title+'\007');

    ((exit)=>{
        process.exit=function(code){
            config.on_exit(code);
            process.stdout.write(clrF(-1));
            exit(code);
        };
    })(process.exit);

    const rl=require('readline').createInterface({
      input:process.stdin,
      output:process.stdout,
      prompt:clrF(config.prompt_color)+config.title+config.prompt_tag+' '+clrF(config.text_color)
    });

    rl.on('line',(line)=>{
        line=line.trim();

        if(line.length>0){
            let args=line.split(' ');
            //is command?//run command.
            if(CMDS[args[0]]!==undefined)CMDS[args.shift()].func.apply(null,args);
            //command not found.
            else console.log(format_error(config.title,'Unknown command ',args[0]));
        }

        rl.prompt();
    });

    rl.on('close',process.exit);

    //———Splash—————————————————————————————————
    console.log(
        clrF(13)+'————————————————————————————————————\n'
        +clrF(11)+'\t*** '+clrF(46)+config.title+clrF(11)+' ***\n\n'
        +clrF(14)+'Input \''+clrF(15)+'.commands'+clrF(14)+'\' for a list of commands\n'
        +clrF(13)+'————————————————————————————————————'+clrF(-1)
    );

    //———Cmds—————————————————————————————————
    const CMDS={
        '.exit':{
            about:'Closes the current process'
            ,params:[]
            ,func:()=>process.exit()
        }
        ,'.commands':{
            about:'Print a list of commands with parameters'
            ,params:[]
            ,func:()=>{
                let msg='';
                for(let cmd in CMDS){
                    if(msg.length>0)msg+='\n';
                    msg+='   '+clrF((cmd[0]==='.')?7:config.cmd_color)+cmd;
                    msg+=clrF(config.text_color)+' (';
                    msg+=clrF(config.param_color)+CMDS[cmd].params.join(' ');
                    msg+=clrF(config.text_color)+')';
                }
                console.log(msg);
            }
        }
        ,'.about':{
            about:'Prints cmd.about information for a specific command'
            ,params:['command:string']
            ,func:(cmd='')=>{
                if(CMDS[cmd]!==undefined){
                    let msg=clrF(config.text_color)+'— ';
                    msg+=clrF(config.cmd_color)+cmd;
                    msg+=clrF(config.text_color)+'(';
                    msg+=clrF(config.param_color)+CMDS[cmd].params.join(' ');
                    msg+=clrF(config.text_color)+')';
                    msg+=clrF(config.prompt_color)+':';
                    msg+=clrF(config.text_color)+'\n  — ';
                    msg+=clrF(config.about_color)+((CMDS[cmd].about.length>0)?CMDS[cmd].about:'No info');
                    console.log(msg);
                }
                else console.log(format_error('.about','command not found: ',cmd));
            }
        }
        ,'.clear':{
            about:'Clears the terminal screen'
            ,params:[]
            ,func:()=>{
                console.clear();
            }
        }
        ,'.color_about':{
            about:'Changes about color'
            ,params:['int:integer']
            ,func:(int='')=>{
                if(int.length>0){
                    let pint=parseInt(int);
                    if(pint===pint)config.about_color=pint;
                    else console.log(format_error('.color_about','int parameter is not integer ',int));
                }
            }
        }
        ,'.color_command':{
            about:'Changes command color'
            ,params:['int:integer']
            ,func:(int='')=>{
                if(int.length>0){
                    let pint=parseInt(int);
                    if(pint===pint)config.cmd_color=pint;
                    else console.log(format_error('.color_command','int parameter is not integer ',int));
                }
            }
        }
        ,'.color_param':{
            about:'Changes parameter color'
            ,params:['int:integer']
            ,func:(int='')=>{
                if(int.length>0){
                    let pint=parseInt(int);
                    if(pint===pint)config.param_color=pint;
                    else console.log(format_error('.color_param','int parameter is not integer ',int));
                }
            }
        }
        ,'.color_error':{
            about:'Changes error color'
            ,params:['int:integer']
            ,func:(int='')=>{
                if(int.length>0){
                    let pint=parseInt(int);
                    if(pint===pint)config.err_color=pint;
                    else console.log(format_error('.color_error','int parameter is not integer ',int));
                }
            }
        }
    };

    for(let a=1;a<arguments.length;a++){
        if(typeof(arguments[a])!=='object')continue;
        for(let c in CMD){
            if(arguments[a][c]===undefined||typeof(arguments[a][c])!==typeof(CMD[c]))
                arguments[a][c]=CMD[c];
        }
        if(arguments[a].name.length<1)continue;
        if(CMDS[arguments[a].name]===undefined){
            CMDS[arguments[a].name]=arguments[a];
            delete CMDS[arguments[a].name].name;            
        }
    }

    //———start
    rl.prompt();

    return config;
};

module.exports=fcmds;