
import React from 'react';
import classes from './Ide.module.css'
import {Controlled as CodeMirror} from 'react-codemirror2';
import axios from 'axios'
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/python/python');
require('codemirror/mode/clike/clike');
require('codemirror/theme/material.css');
require('codemirror/theme/eclipse.css');


var defaults = {
	clike: "#include <iostream>\nusing namespace std;\n\nint main() {\n\t// your code goes here\n\treturn 0;\n}",
	python: '# cook your dish here'
};
var modeAndLanguageCode ={
  python2:{
    mode:"python",
    languageCode:70
  },
  python3:{
    mode:"python",
    languageCode:71
  },
  clike7:{
    mode:"clike",
    languageCode:52
  },
  clike8:{
    mode:"clike",
    languageCode:53
  },
  clike9:{
    mode:"clike",
    languageCode:54
  }
}


class Ide extends React.Component {
  state={
        value:defaults.python,
		readOnly: false,
        mode: "python2",
        result :null,
        input:null,
        theme:"material",
        loading:false,
        checked:true,
        show:false
  }

  updateCode =(editor,data,value,type)=> {
      if(type === 'editor'){
		this.setState({
			value:value
        });
    }else if(type === 'input'){
        this.setState({
            input:value
        })
    }
  }

  onSubmit=()=>{
      this.setState({
          loading:true,
          result:null,
          show:false
      })
    axios.post('http://localhost:3001/submitCode',{
      code:this.state.value,
      languageId:modeAndLanguageCode[this.state.mode].languageCode,
      input:this.state.input
      }).then((response)=>{
        console.log(response)
        if(response.data){
          setTimeout(()=>{
            axios.get('http://localhost:3001/getResult/'+response.data.response.token).then((response)=>{
              console.log(response)
              this.setState({
                loading:false,
                result:response.data,
                show:true
            })
            }).catch((e)=>{
              console.log(e)
              this.setState({
                loading:false,
                show:true
            })
            })
          },5000)
       
      }

      }).catch((e)=>{
        console.log(e)
        this.setState({
            loading:false
        })
      })
  }
  checkBoxHandler=()=>{
      this.setState({
          checked:!this.state.checked
      })
  }

  
  changeModeAndTheme (e,type) {
        var mode = e.target.value;
        if(type === 'mode' ){

            this.setState({
                mode: mode,
                value: defaults[modeAndLanguageCode[mode].mode]
            });
        }else if(type === 'theme'){
            console.log(mode)
            this.setState({
                theme:mode
            });
        }
	}
onClear=()=>{
    console.log(modeAndLanguageCode[this.state.mode].mode)
    this.setState({
        value: defaults[modeAndLanguageCode[this.state.mode].mode]
    });
}
  render(){
    
    var options = {
			lineNumbers: true,
			readOnly: this.state.readOnly,
            mode:  modeAndLanguageCode[this.state.mode].mode,
            theme:this.state.theme,
            indentWithTabs:true,
            padding:"1%"
            
        };
        
    var display = this.state.loading ? "block":"none";
    var displayInput = this.state.checked ? "block":"none";
    var info = this.state.show ? 
        this.state.result ? 
        <div className={classes.info}>
        
        <span><b className={classes.cross}>Results</b><span style={{cursor:"pointer"}} onClick={()=>{this.setState({show:false})}}>x</span></span>
        <hr className={classes.line}/>
            <span><b>Status:</b>{this.state.result.description}</span>
            <span><b>Date:</b>{this.state.result.date}</span>
            <span><b>Time:</b>{this.state.result.time} Sec</span>
            <span><b>Memory:</b>{this.state.result.memory/1000} Kb</span>
        
        </div>  :null
        
        : null;
        console.log(display)
  return (
    <div className={classes.Ide}>
            <div className={classes.header}>
            Online Python/C++ Ide
            </div>
            <div className={classes.main}>
                    <div className={classes.codeEditor}>
                  
                    <span className={classes.head}>Type Code Here :</span>
                        <div className={classes.code}>
                        <CodeMirror 
                        className={classes.CodeMirror}
                        refs="editor" 
                        value={this.state.value} 
                        onBeforeChange={(editor,data,value)=>this.updateCode(editor,data,value,"editor")}   
                        onChange={(editor,data,value)=>this.updateCode(editor,data,value,"editor")} 
                        options={options} 
                        autoFocus={true} /> 
                    </div>
                    <div className={classes.checkBox}>
                    <input type="checkbox" id="custom input" name="Custom Input" onClick={this.checkBoxHandler} checked={this.state.checked} />
                    <label for="Custom Input"> Custom Input </label><br/>
                    </div>
                        <div className={classes.options}>       
                       
                        <div className={classes.buttons}>
                            <button className={classes.btn} onClick={this.onSubmit} disabled={this.state.loading }>Build And Run</button>
                            <button className={classes.rbtn} onClick={this.onClear} disabled={this.state.loading }>Clear</button>
                        </div>
                        <div className={classes.dropdowns}>

                        <div className={classes.dropdown}>
                        <select onChange={(e)=>this.changeModeAndTheme(e,"theme")} value={this.state.theme}>
                        <option value="material">Dark Mode</option>
                        <option value="eclipse">Light Mode</option>
                        </select>
                        </div>
                        
                            <div className={classes.dropdown}>
                            <select onChange={(e)=>this.changeModeAndTheme(e,"mode")} value={this.state.mode}>
                                <option value="python2">Python (2.7.17)</option>
                                <option value="python3">Python (3.8.1)</option>
                                <option value="clike8">C++ (GCC 7.4.0)</option>
                                <option value="clike8">C++ (GCC 8.3.0)</option>
                                <option value="clike9">C++ (GCC 9.2.0)</option>
                            </select>
                            </div>
                       
                          
                        </div>
                        
                        
                    </div>
                    <span className={classes.head} style={{display:display}} >Processing ...</span>
                    {info}
                    </div>
            <div className={classes.resultAndOutput}>
          
            <span className={classes.head} style={{display:displayInput}}>Inputs</span>
            <div className={classes.input} style={{display:displayInput}}>
            <CodeMirror 
                 className={classes.CodeMirror}
                value={this.state.input} 
                onBeforeChange={(editor,data,input)=>this.updateCode(editor,data,input,"input")}
                onChange={(editor,data,input)=>this.updateCode(editor,data,input,"input")} 
                options={options} 
                autoFocus={true} />
            </div>
            <br/>
            <span className={classes.head}>Output</span>
                    <div className={classes.output}>
                    < CodeMirror  
                    className={classes.CodeMirror}
                        value={this.state.result ? this.state.result.response: null} 
                        options={{theme:this.state.theme}} 
                        />
                    </div>
                   
            </div>
        </div>
        </div>
      );
}
}

export default Ide;
