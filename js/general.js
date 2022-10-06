let params = {
    client_id:
      "2349570258-9v9dbm2m582q6aspla27nvaa3hc5ju08.apps.googleusercontent.com",
};
let general_forms = [];

function alert(message, type, duration) {
    $("#alert_success").remove()
    $("body").append(`
        <div id="alert_success">
            <v-app id="inspire">
                <v-alert dense text type="${type}" class="mensaje_success" style="position: fixed; bottom: -15%; left: 30px; z-index: 10000000; background-color: white !important;">${message}</v-alert>
            </v-app>
        </div>
    `)

    new Vue({
        el: '#alert_success',
        vuetify: new Vuetify(),
    })

    $(".mensaje_success").animate({ "bottom": "15px" }, 500)

    setTimeout(function () {
        $(".mensaje_success").animate({ "bottom": -$(".mensaje_success").height()-50 }, 500)
    }, duration);
}

function modal(txt, width, txt_btn){
    let id_create = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
    $("body").append(`
        <div id="${id_create}">
            <v-app id="inspire">
                <v-row justify="center">
                    <v-dialog
                        v-model="dialog"
                        width="${width}"
                    >
                        <v-card>
                            ${txt}
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                color="green darken-1"
                                text
                                @click="dialog=false"
                                >
                                ${txt_btn == undefined ? "Salir" : txt_btn}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-row>
            </v-app>
        </div>
    `)

    return new Vue({
        el: `#${id_create}`,
        vuetify: new Vuetify(),
        data () {
          return {
            dialog: true,
          }
        },
    })
}

function sendRequestGET(url, cache, contet_type, type_petition) {
    var inf_cache = get_variables_cache("inf_cache") == undefined ? {} : JSON.parse( get_variables_cache("inf_cache") );
    if( cache != false && inf_cache[url] != undefined && inf_cache[url].contet_type == contet_type ){
        return inf_cache[url].data
    }else{
        var validar = false;
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Content-Type", contet_type);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status == 200) {
                    validar = true;
                    inf_cache[url] = {
                        "contet_type" : contet_type,
                        "cache" : cache,
                    }

                    let status = JSON.parse(xhr.responseText)
                    if( status.status == 0 ){
                        alert(`Error; interno contacte con el administrador: ${status.mensaje}`, "error", 10000)
                        inf_cache[url].data = status;
                    }else if( status.status == 1 || status.status == 2 ){
                        if( type_petition == "message" || type_petition == undefined )
                            inf_cache[url].data = status.mensaje;
                        else if( type_petition == "status" )
                            inf_cache[url].data = status;
                    }

                    if( cache != false ){
                        set_variables_cache( "inf_cache", JSON.stringify( inf_cache ) );
                    }
                        
                    resolve(inf_cache[url].data);
                }
            };
            xhr.send();
    
            setTimeout(function () {
                if (!validar) {
                    // alert( `Error la url demora demasiado en responder \n\n url: \n\n ${url} ` )
                    resolve(`Error la url demora demasiado en responder \n\n url: \n\n ${url} `);
                }
            }, 50000);
        });
    }
}

function sendRequestPOST( url, send, contet_type, cache, type_petition, timeout ){
    var inf_cache = get_variables_cache("inf_cache") == undefined ? {} : JSON.parse( get_variables_cache("inf_cache") );
    if( cache != false && inf_cache[url] != undefined && inf_cache[url].send == send && inf_cache[url].contet_type == contet_type ){
        console.log(1)
        return inf_cache[url].data
    }else{
        var validar = false;
        return new Promise(resolve => {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': contet_type,
                    'Content-Type': contet_type
                },
                body: JSON.stringify( send )
            })
                .then(res => res.json())
                .then((status) => {
                    validar = true;
                    inf_cache[url] = {
                        "contet_type" : contet_type,
                        "cache" : cache,
                    }

                if( status.status == 0 ){
                    alert(`Error; interno contacte con el administrador: ${status.mensaje}`, "error", 10000)
                    inf_cache[url].data = status;
                }else if( status.status == 1 || status.status == 2 ){
                    if( type_petition == "message" || type_petition == undefined )
                        inf_cache[url].data = status.mensaje;
                    else if( type_petition == "status" )
                        inf_cache[url].data = status;
                }

                if( cache != false ){
                    set_variables_cache( "inf_cache", JSON.stringify( inf_cache ) );
                }
                    
                resolve(inf_cache[url].data);

            }).catch(function(error) {
                resolve(`Error el sitio <b>${url}</b> no responde`);
                alert(`Error; interno contacte con el administrador: ${error}`, "error", 10000)
            });
    
            if( timeout != false ){
                setTimeout(function () {
                    if (!validar) {
                        resolve(`Error la url demora demasiado en responder \n\n url: \n\n <b>${url}</b> `);
                        alert(`Error; interno contacte con el administrador: Error la url demora demasiado en responder \n\n url: \n\n <b>${url}</b>`, "error", 10000)

                    }
                }, 50000);
            }
        });
    }
}

function set_variables_cache( index, data ){
    try{localStorage.setItem( index, data);}
    catch(e){}
}

function get_variables_cache( index ){
    try{return localStorage.getItem( index);}
    catch(e){ return undefined }
}

function clear_cache( index ){
    if( index!= undefined )
        localStorage.removeItem( index );
    else
        localStorage.clear();
}

function loading( status ){
    if( status )
        $("body").append(`
            <div class="loading">
                <svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                    <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
                </svg>
            </div>
        `)
    else
        $(".loading").remove()
}

function array_to_json( array ){
    let return_json = []
    // console.log( array )
    for( var i=1; i<array.length; i++ ){
        return_json[i-1] = {};
        for( var j=0; j<array[0].split("\t").length; j++ )
            return_json[i-1][array[0].split("\t")[j]] = array[i].split("\t")[j];
    }
    return return_json;
}

function stop(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ramdom(){
    return Math.random().toString(30).slice(-15).replace(/[.]/g,"_")
}

function create_form( config ){
    //type = text, select, file, file_multiple, textarea, 
    //label = nombre del campo
    //Button =  es el click de un boton interno en el input 
    //{type:"text", md:12, label:["Nombre del campo"], counter:[20], button:{ _click:function(){ console.log("asdasdasd") } }}
    //class = clase del objeto
    //counter = cantidad de caracteres, solo aplica para text
    //items = solo aplica para el select, elementos del select ejemplo [{id:1,"name":"cosa"}]
    //_change = funcion de llamado de cambio
    //_mouseover = funcion de llamado de mouseover
    //_click = funcion de llamado de click
    //cant = integer que indica la cantidad de elementos duplicados del mismo objeto
    let id_create = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
    for( let i=0; i<config.inputs.length; i++  ){
        config.inputs[i].cant = config.inputs[i].cant == null ? 1 : config.inputs[i].cant; 
        let cant = config.inputs[i].cant == 0 ? 1 : config.inputs[i].cant;
        for( let j=0; j<cant; j++  ){
            if( config.inputs[i]._change == null )
                config.inputs[i]._change = [function(){}];
            else if( typeof(config.inputs[i]._change) == 'function' )
                config.inputs[i]._change[j] = config.inputs[i]._change;
            if( config.inputs[i]._change[j] == null )
                config.inputs[i]._change[j] = [function(){}];

            if( config.inputs[i]._mouseover == null )
                config.inputs[i]._mouseover = [function(){}];
            else if( typeof(config.inputs[i]._mouseover) == 'function' )
                config.inputs[i]._mouseover[j] = config.inputs[i]._mouseover;
            if( config.inputs[i]._mouseover[j] == null )
                config.inputs[i]._mouseover[j] = [function(){}];

            if( config.inputs[i]._mouseleave == null )
                config.inputs[i]._mouseleave = [function(){}];
            else if( typeof(config.inputs[i]._mouseleave) == 'function' )
                config.inputs[i]._mouseleave[j] = config.inputs[i]._mouseleave;
            if( config.inputs[i]._mouseleave[j] == null )
                config.inputs[i]._mouseleave[j] = [function(){}];
            
            if( config.inputs[i]._click == null )
                config.inputs[i]._click = [function(){}];
            else if( typeof(config.inputs[i]._click) == 'function' )
                config.inputs[i]._click[j] = config.inputs[i]._click;
            if( config.inputs[i]._click[j] == null )
                config.inputs[i]._click[j] = [function(){}];

            if( config.inputs[i]._keyup == null )
                config.inputs[i]._keyup = [function(){}];
            else if( typeof(config.inputs[i]._keyup) == 'function' )
                config.inputs[i]._keyup[j] = config.inputs[i]._keyup;
            if( config.inputs[i]._keyup[j] == null )
                config.inputs[i]._keyup[j] = [function(){}];

            if( config.inputs[i].element == null )
                config.inputs[i].element = [];
            else if( typeof(config.inputs[i].element) == 'number' || typeof(config.inputs[i].element) == 'string' )
                config.inputs[i].element = [ config.inputs[i].element ]
            if( config.inputs[i].element[j] == null )
                config.inputs[i].element[j] = [];

            if( config.inputs[i].type_input == null )
                config.inputs[i].type_input = [''];
            else if( typeof(config.inputs[i].type_input) == 'string' )
                config.inputs[i].type_input = [ config.inputs[i].type_input.toString() ]
            if( config.inputs[i].type_input[j] == null )
                config.inputs[i].type_input[j] = '';

            if( config.inputs[i].items == null )
                config.inputs[i].items = [];
            else if( Array.isArray(config.inputs[i].items) && !Array.isArray(config.inputs[i].items[j]) )
                config.inputs[i].items = [config.inputs[i].items]
            if( config.inputs[i].items[j] == null )
                config.inputs[i].items[j] = [];
            
            if( config.inputs[i].accept == null )
                config.inputs[i].accept = [];
            if( config.inputs[i].accept[j] == null )
                config.inputs[i].accept[j] = "";

            if( config.inputs[i].class == null )
                config.inputs[i].class = [];
            if( config.inputs[i].class[j] == null )
                config.inputs[i].class[j] = "";

            if( config.inputs[i].clearable == null )
                config.inputs[i].clearable = [];
            else if( typeof(config.inputs[i].clearable) == 'number' || typeof(config.inputs[i].clearable) == 'string' )
                config.inputs[i].clearable = [ config.inputs[i].clearable ]
            if( config.inputs[i].clearable[j] == null )
                config.inputs[i].clearable[j] = false;

            if( config.inputs[i].multiple == null )
                config.inputs[i].multiple = [false];
            else if( typeof(config.inputs[i].multiple) == 'string' || typeof(config.inputs[i].multiple) == 'boolean' )
                config.inputs[i].multiple = [ config.inputs[i].multiple.toString() == "true" ]
            if( config.inputs[i].multiple[j] == null )
                config.inputs[i].multiple[j] = false;

            if( config.inputs[i].disabled == null )
                config.inputs[i].disabled = [false];
            else if( typeof(config.inputs[i].disabled) == 'number' || typeof(config.inputs[i].disabled) == 'string' )
                config.inputs[i].disabled = [ config.inputs[i].disabled ]
            if( config.inputs[i].disabled[j] == null )
                config.inputs[i].disabled[j] = false;

            if( config.inputs[i].md == null )
                config.inputs[i].md = "12";
            if( config.inputs[i]["offset-md"] == null )
                config.inputs[i]["offset-md"] = "0";

            //Altura para los textarea
            if( config.inputs[i].row == null )
                config.inputs[i].row = [5];
            else if( typeof(config.inputs[i].row) == 'number' || typeof(config.inputs[i].row) == 'string' )
                config.inputs[i].row = [ config.inputs[i].row ]
            if( config.inputs[i].row[j] == null )
                config.inputs[i].row[j] = 5;

            //Regex
            if( config.inputs[i].regex == null )
                config.inputs[i].regex = [""];
            else if( typeof(config.inputs[i].regex) == 'number' || typeof(config.inputs[i].regex) == 'string' )
                config.inputs[i].regex = [ config.inputs[i].regex ]
            if( config.inputs[i].regex[j] == null )
                config.inputs[i].regex[j] = "";
            
            //Se pone un id generico si el elemento no lo tiene
            if( config.inputs[i].id == null )
                config.inputs[i].id = [ramdom()];
            else if( typeof(config.inputs[i].id) == 'number' || typeof(config.inputs[i].id) == 'string' )
                config.inputs[i].id = [ config.inputs[i].id ]
            if( config.inputs[i].id[j] == null )
                config.inputs[i].id[j] = [ramdom()];

            //Si el contador no existe
            if( config.inputs[i].counter == null )
                config.inputs[i].counter = [100];
            else if( typeof(config.inputs[i].counter) == 'number' || typeof(config.inputs[i].counter) == 'string' )
                config.inputs[i].counter = [ config.inputs[i].counter ]
            if( config.inputs[i].counter[j] == null )
                config.inputs[i].counter[j] = [100];

            if( config.inputs[i].label == null )
                config.inputs[i].label = [""];
            else if( typeof(config.inputs[i].label) == 'number' || typeof(config.inputs[i].label) == 'string' )
                config.inputs[i].label = [ config.inputs[i].label ]
            if( config.inputs[i].label[j] == null )
                config.inputs[i].label[j] = [""];

            if( config.inputs[i].show == null )
                config.inputs[i].show = true;
            
            // icons inputs
            if( config.inputs[i].button == undefined )
                config.inputs[i].button = [ { "icon": [] } ]
            else
                for( let j=0; j<config.inputs[i].button.length; j++  )
                    for( let k=0; k<config.inputs[i].button[j].icon.length; k++  ){
                        if( config.inputs[i].button[j].icon[k]._click == undefined ){ config.inputs[i].button[j].icon[k]._click = function(){} }
                    }
        }
    }
    
    //Columnas del formulario
    if( config.button != undefined ){
        for( let i=0; i<config.button.length; i++  ){
            if( config.button[i].md == null )
                config.button[i].md = "";
            if( config.button[i]["offset-md"] == null )
                config.button[i]["offset-md"] = "";
        }
    }

    //Class
    if( config.class == null )
        config.class = "";

    $(config.id_class).append(`
        <div id="${id_create}" class="${config.class}">
            <v-app id="inspire">
                <v-row>
                    <v-col v-if="title != ''" :md="title_md" :offset-md="title_offset">
                        <h1 v-if="title != ''">{{title}} <v-icon>{{title_icon}}</v-icon></h1>
                        <span v-show="subtitle!=''">{{subtitle}}</span>
                        <br v-show="subtitle!=''"><br v-show="subtitle!=''">
                    </v-col>
                    <v-col md=12>
                        <v-row>
                            <v-col v-for="(rows, i) in inputs.length" :md="inputs[i].md" :offset-md="inputs[i]['offset-md']" v-show=inputs[i].show>
                                <span v-if="inputs[i].type == 'span'" v-for="(rows, j) in inputs[i].cant"
                                    :id="inputs[i].id[j]"
                                    :class="inputs[i].class"
                                ></span>
                                <v-select v-if="inputs[i].type == 'select'" v-for="(rows, j) in inputs[i].cant"
                                    v-model="inputs[i].element[j]"
                                    :id="inputs[i].id[j]"
                                    :items="inputs[i].items[j]"
                                    :label="inputs[i].label[j]"
                                    :class="inputs[i].class[j]"
                                    :disabled=inputs[i].disabled[j]
                                    :multiple=inputs[i].multiple[j]
                                    item-value="id"
                                    item-text="name"
                                    @click="inputs[i]._click[j](inputs[i])"
                                    @change="inputs[i]._change[j](inputs[i])"
                                    @mouseover="inputs[i]._mouseover[j](inputs[i])"
                                    @mouseleave="inputs[i]._mouseleave[j](inputs[i])"
                                >
                                </v-select>
                                <span v-if="inputs[i].type == 'color'" v-for="(rows, j) in inputs[i].cant">
                                    {{inputs[i].label[j]}}<br>
                                    <input type="color" 
                                        v-model="inputs[i].element[j]"
                                        :id="inputs[i].id[j]"
                                        @change="inputs[i]._change[j](inputs[i])"
                                    >
                                </span>
                                <span v-if="inputs[i].type == 'vue_color'" v-for="(rows, j) in inputs[i].cant">
                                    {{inputs[i].label[j]}}
                                    <v-color-picker
                                        v-model="inputs[i].element[j]"
                                        :id="inputs[i].id[j]"
                                        dot-size="25"
                                        hide-canvas
                                        hide-mode-switch
                                        mode="hexa"
                                        swatches-max-height="100"
                                    ></v-color-picker>
                                </span>
                                <v-autocomplete v-if="inputs[i].type == 'autocomplete'" v-for="(rows, j) in inputs[i].cant"
                                    v-model="inputs[i].element[j]"
                                    :id="inputs[i].id[j]"
                                    :items="inputs[i].items[j]"
                                    :label="inputs[i].label[j]"
                                    :class="inputs[i].class[j]"
                                    :disabled=inputs[i].disabled[j]
                                    :clearable=inputs[i].clearable[j]
                                    item-value="id"
                                    item-text="name"
                                    @click="inputs[i]._click[j](inputs[i])"
                                    @change="inputs[i]._change[j](inputs[i])"
                                    @mouseover="inputs[i]._mouseover[j](inputs[i])"
                                    @mouseleave="inputs[i]._mouseleave[j](inputs[i])"
                                ></v-autocomplete>
                                <v-text-field v-if="inputs[i].type == 'text'" v-for="(rows, j) in inputs[i].cant"
                                    v-model="inputs[i].element[j]"
                                    :id="inputs[i].id[j]"
                                    :rules="rol[i]"
                                    :counter="inputs[i].counter[j]"
                                    :class="inputs[i].class[j]"
                                    :label="inputs[i].label[j]"
                                    :type=inputs[i].type_input[j]
                                    :disabled=inputs[i].disabled[j]
                                    @click="inputs[i]._click[j](inputs[i])"
                                    @keyup="inputs[i]._keyup[j](inputs[i])"
                                    @mouseover="inputs[i]._mouseover[j](inputs[i])"
                                    @mouseleave="inputs[i]._mouseleave[j](inputs[i])"
                                required>
                                    <v-icon v-if="inputs[i].button != undefined && typeof(inputs[i].button.length) == 'number'" v-for="(rows, k) in inputs[i].button[j].icon.length"
                                        :slot="inputs[i].button[j].icon[k].type"
                                        :color="inputs[i].button[j].icon[k] == undefined ? 'black' : inputs[i].button[j].icon[k].color"
                                        :class="inputs[i].button[j].icon[k] == undefined ? '' : inputs[i].button[j].icon[k].class"
                                        @click=inputs[i].button[j].icon[k]._click(inputs[i])
                                    >
                                        {{inputs[i].button[j].icon[k].value}}
                                    </v-icon>
                                </v-text-field>
                                <v-textarea v-if="inputs[i].type == 'textarea'" v-for="(rows, j) in inputs[i].cant"
                                    v-model="inputs[i].element[j]"
                                    :id="inputs[i].id[j]"
                                    :label="inputs[i].label[j]"
                                    :class="inputs[i].class[j]"
                                    :disabled=inputs[i].disabled[j]
                                    :rows="inputs[i].row[j]"
                                    @click="inputs[i]._click[j](inputs[i])"
                                    @keyup="inputs[i]._keyup[j]"
                                    @mouseover="inputs[i]._mouseover[j](inputs[i])"
                                    @mouseleave="inputs[i]._mouseleave[j](inputs[i])"
                                    solo
                                ></v-textarea>
                                <v-file-input v-if="inputs[i].type == 'file'" v-for="(rows, j) in inputs[i].cant"
                                    v-model="inputs[i].element[j]"
                                    :id="inputs[i].id[j]"
                                    :label="inputs[i].label[j]"
                                    :accept="inputs[i].accept[j]"
                                    :class="inputs[i].class[j]"
                                    :disabled=inputs[i].disabled[j]
                                    @change="inputs[i]._change[j](inputs[i])"
                                    @click="inputs[i]._click[j](inputs[i])"
                                    @mouseover="inputs[i]._mouseover[j](inputs[i])"
                                    @mouseleave="inputs[i]._mouseleave[j](inputs[i])"
                                    show-size
                                ></v-file-input>
                                <v-file-input v-if="inputs[i].type == 'file_multiple'" v-for="(rows, j) in inputs[i].cant"
                                    v-model="inputs[i].element[j]"
                                    :id="inputs[i].id[j]"
                                    :label="inputs[i].label[j]"
                                    :class="inputs[i].class[j]"
                                    :disabled=inputs[i].disabled[j]
                                    @click="inputs[i]._click[j](inputs[i])"
                                    @mouseover="inputs[i]._mouseover[j](inputs[i])"
                                    @mouseleave="inputs[i]._mouseleave[j](inputs[i])"
                                    show-size
                                    multiple
                                ></v-file-input>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col  v-for="(rows, i) in f_action.length" :md="f_action[i].md" :offset-md="f_action[i]['offset-md']">
                                <v-app>
                                    <v-btn depressed 
                                    v-model="f_action[i].element"
                                    :color="f_action[i].color"
                                    :loading="f_action[i].loading"
                                    :disabled="f_action[i].disabled"
                                    @click="f_action[i]._function">
                                        {{f_action[i].label}}
                                    </v-btn>
                                </v-app>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-app>
        </div>
    `)

    general_forms.push(
        new Vue({
            el: `#${id_create}`,
            vuetify: new Vuetify(),
            data: () => ({
                id_create:id_create,
                title:config.title == undefined ? '' : config.title,
                title_icon:config.title_icon,
                title_md:config.md,
                title_offset:config["offset-md"],
                valid: false,
                i_name: "",
                i_description: "",
                subtitle:'',
                rol: [],
                f_action:config.button,
                inputs:config.inputs,
                id_create:id_create,
            }),
            mounted(){
                for( let i=0; i<this.inputs.length; i++ )
                    for( let j=0; j<this.inputs[i].cant; j++ ){
                        let re = new RegExp(this.inputs[i].regex[0], "");
                        if( this.inputs[i].counter != undefined && this.inputs[i].counter[j] != undefined )
                            this.rol.push([
                                v => !!v || `El campo ${this.inputs[i].label[j]} no puede ser vacio`,
                                v => v.length <= this.inputs[i].counter[j] || `Este campo no debe superar los ${this.inputs[i].counter[j]} caracteres`,
                                v => re.test(v)||'Formato incorrecto',
                            ])
                        else
                            this.rol.push([])

                        //Se pinta el texto en el span
                        if( this.inputs[i].type == 'span' && this.inputs[i].text != undefined ){
                            if( typeof(this.inputs[i].text[j]) == "string" )
                                $(`#${this.inputs[i].id[j]}`).html(this.inputs[i].text)
                            else
                                $(`#${this.inputs[i].id[j]}`).html(this.inputs[i].text[j])
                        }
                    }
            },
            methods: {
                get_info_id(id){
                    for( let i_g=0; i_g<this.inputs.length; i_g++  )
                        if( this.inputs[i_g].id[0] == id )
                            return this.inputs[i_g]
                },
                destroy() {
                    $(`#${this.id_create}`).remove()
                },
            },
        })
    )

    return general_forms[general_forms.length-1]
}

function create_table( config ){
    let txt_template = '';

    if( config._click != undefined )
        for( let i=0; i<config.desserts.length; i++ ){
            if( config.desserts[i].color == undefined )
                config.desserts[i].color = []
            if( config.desserts[i].icon == undefined )
                config.desserts[i].icon = []
        }
    else
        config._click = [];
        
    
    for( let i=0; i<config._click.length; i++ ){
        if( config._click[i].show != false  ){
            let valid_column = true;

            for( let j=0; j<config._click.length; j++ )
                if( config.headers[j] != null && config.headers[j].value == `click_${i}` )
                    valid_column = false;

            if( valid_column )
                config.headers.push( { text: config._click[i].text, value: `click_${i}` } )

            txt_template += `<template v-slot:item.click_${i}="{ item }" >
                                <div style="text-align: center">
                                    <v-icon
                                        @click="click[${i}].function(item)"
                                        :title="item.title == undefined ? click[${i}].text : item.title[${i}]"
                                        :color="item.color == undefined ? black : item.color[${i}]"
                                    >
                                        ${ config._click[i].icon != undefined ? `{{click[${i}].icon}}` : `{{item.icon[${i}]}}` }
                                    </v-icon>
                                </div>
                            </template>`;
        }
    }

    let id_create = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
    $(config.id_class).append(`
        <div id="${id_create}" style="width: 100%;">
            <v-app>
                <v-row>
                    <v-col ${ config.md != undefined && config.md != '' ? `md=${config.md}`:'md=12'} ${ config["offset-md"] != undefined && config["offset-md"] != '' ? `offset-md=${config["offset-md"]}`:'offset-md=0'} offset-md=1>
                        <v-card style="padding: 20px">
                            <h1 style="padding:20px 20px 0px 20px" v-show="title!= undefined && title!= ''">{{title}} <v-icon dense>{{title_icon}}</v-icon></h1>
                            <v-card-title v-show="show_search">
                                <v-text-field
                                    v-model="search"
                                    append-icon="mdi-magnify"
                                    label="Buscar"
                                    class="search_space"
                                    single-line
                                    hide-details
                                ></v-text-field>
                            </v-card-title>
                            <v-data-table
                                :headers="headers"
                                :items="desserts"
                                :search="search"
                                :items-per-page="5"
                                :hide-default-header="show_header"
                                :hide-default-footer="show_footer"
                                :footer-props="{
                                    'items-per-page-text':'Items por página',
                                               
                                }"
                            >
                                ${txt_template}
                            </v-data-table>
                        </v-card>
                    </v-col>
                </v-row> 
            </v-app>   
        </div>
    `)

    new Vue({
        el: `#${id_create}`,
        vuetify: new Vuetify(),
        data() {
            return {
                search: '',
                headers: config.headers,
                desserts: config.desserts,
                click: config._click,
                title:config.title,
                title_icon:config.title_icon,
                show_search: config.show_search != false,
                show_header: config.show_header == false,
                show_footer: config.show_footer == false,
            }
        },
    })
}

function valid_form(form){
    let valid = true
    for( let i=0; i<form.inputs.length; i++ )
        for( let j=0; j<form.inputs[i].cant; j++ )
            if( valid ){
                if( form.inputs[i].element[j] == '' || form.inputs[i].element[j] == undefined ){
                    alert( `El campo <b>${form.inputs[i].label[j]}</b> no puede ser vacio`, "error", 5000 );
                    valid = false;
                }else if( form.inputs[i].type != 'select' && form.inputs[i].type != 'file' && form.inputs[i].type != 'textarea' && form.inputs[i].element[j].length > form.inputs[i].counter[j] ){
                    alert( `El campo <b>${form.inputs[i].label[j]}</b> no debe superar los <b>${form.inputs[i].counter[j]} caracteres</b>`, "error", 5000 );
                    valid = false;
                }else if( form.inputs[i].regex != undefined && form.inputs[i].regex[j] != '' && form.inputs[i].type == 'text' ){
                    let re = new RegExp(form.inputs[i].regex[j], "g");
                    if( !re.test( form.inputs[i].element[j] ) ){
                        alert( `El campo <b>${form.inputs[i].label[j]}</b> no tiene el formato correcto`, "error", 5000 );
                        valid = false;
                    }
                }
            }
                

    return valid;
}

async function box_direccion( input ){
    loading(true)
    if( $(`.edit_direction` ).length == 0 ){
        let tipo_direccion = [];
        let items_sector_ciudad = [{id:"",name:"Ninguno"}];
        let items_clase_via_principal = [{id:"",name:"Ninguno"}];
        let items_get_sector_predio = [{id:"",name:"Ninguno"}];
        let data_table_dir = array_to_json_data( await sendRequestPOST("/request/get_data_table", {table:"direccion"}, 'application/json', true) ) 
        let result_tipodireccion = await sendRequestGET("/request/get_tipo_direccion", true, 'application/json')
        let result_sector_ciudad = await sendRequestGET("/request/get_sector_ciudad", true, 'application/json')
        let result_clase_via_principal = await sendRequestGET("/request/get_clase_via_principal", true, 'application/json')
        let result_get_sector_predio = await sendRequestGET("/request/get_sector_predio", true, 'application/json')
        result_tipodireccion.forEach(data => tipo_direccion.push({ id:data.id_tipodireccion ,name:data.descripcion_tipo_direccion }));
        result_sector_ciudad.forEach(data => items_sector_ciudad.push({ id:data.id_sectorciudad ,name:data.descripcion_sector_ciudad }));
        result_clase_via_principal.forEach(data => items_clase_via_principal.push({ id:data.id_claseviaprincipal ,name:data.descripcion_clase_via_principal }));
        result_get_sector_predio.forEach(data => items_get_sector_predio.push({ id:data.id_sectorpredio ,name:data.descripcion_sector_predio }));
        
        modal_direction = modal(`<div class="row"><div class="col-md-10 offset-md-1 edit_direction"></div></div>`,"80%","Guardar")
        let form_dir = create_form({
            id_class:".edit_direction",
            title:"Edición de dirección",
            title_icon:"mdi-map-marker-outline",
            inputs:[
                { type:"select", md:12, label:[data_table_dir.id_tipodireccion], items:[tipo_direccion], _change: [function(){
                    form_dir.inputs[9].show = form_dir.inputs[8].show = form_dir.inputs[7].show = form_dir.inputs[6].show = form_dir.inputs[5].show = form_dir.inputs[4].show = form_dir.inputs[3].show = form_dir.inputs[2].show = form_dir.inputs[1].show = form_dir.inputs[0].element[0] == 1
                    form_dir.inputs[10].show = form_dir.inputs[0].element[0] == 2 || ( form_dir.inputs[9].element[0] == 1 && form_dir.inputs[0].element[0] == 1 )
                    if( form_dir.inputs[0].element[0] == 2 )
                        form_dir.inputs[10].md = 12
                    else
                        form_dir.inputs[10].md = 6

                    form_dir.inputs[11].show = form_dir.inputs[11].element[0].length != 0
                }]},
                { type:"select", show:false, md:3, label:[data_table_dir.id_claseviaprincipal], items:[items_clase_via_principal], _change:[ function(){ form_dir.inputs[11]._click[0]() } ]},
                { type:"text", show:false, md:3, label:[data_table_dir.valor_via_principal], counter:[20], _keyup:[function(){ form_dir.inputs[11]._click[0]() }]},
                { type:"text", show:false, md:3, label:[data_table_dir.letra_via_principal], counter:[5], _keyup:[function(){ form_dir.inputs[11]._click[0]() }]},
                { type:"select", show:false, md:3, label:[data_table_dir.id_sectorciudad], items:[items_sector_ciudad], _change:[function(){ form_dir.inputs[11]._click[0]() }] },
                { type:"text", show:false, md:3, label:[data_table_dir.valor_via_generadora], counter:[5], _keyup:[function(){ form_dir.inputs[11]._click[0]() }]},
                { type:"text", show:false, md:3, label:[data_table_dir.letra_via_generadora], counter:[20], _keyup:[function(){ form_dir.inputs[11]._click[0]() }]},
                { type:"text", show:false, md:3, label:[data_table_dir.numero_predio], counter:[20], _keyup:[function(){ form_dir.inputs[11]._click[0]() }]},
                { type:"select", show:false, md:3, label:[data_table_dir.id_sectorpredio], items:[items_get_sector_predio], _change:[function(){ form_dir.inputs[11]._click[0]() }] },
                { type:"select", show:false, md:6, label:[data_table_dir.complemento], items:[[{id:1,name:"Si"},{id:0,name:"No"}]], _change: [function(){
                    form_dir.inputs[10].show = form_dir.inputs[9].element[0] == 1
                    form_dir.inputs[11]._click[0]();
                }] },
                { type:"text", show:false, md:6, label:[data_table_dir.nombre_predio], counter:[20], _keyup:[function(){ 
                    console.log( form_dir.inputs[11] )
                    form_dir.inputs[11]._click[0]() }]},
                { type:"textarea", show:false, md:12, label:["Resultado dirección"], disabled:[true], class:["text_valid"], row:[1], _click:[async function(){
                    let text_final = ``;

                    if( form_dir.inputs[2].element[0].length != 0 )
                        form_dir.inputs[2].element[0] = form_dir.inputs[2].element[0].replace(/[^0-9]/g,"");
                    if( form_dir.inputs[3].element[0].length != 0 )
                        form_dir.inputs[3].element[0] = form_dir.inputs[3].element[0].replace(/[0-9]/g,"");
                    if( form_dir.inputs[5].element[0].length != 0 )
                        form_dir.inputs[5].element[0] = form_dir.inputs[5].element[0].replace(/[^0-9]/g,"");
                    if( form_dir.inputs[6].element[0].length != 0 )
                        form_dir.inputs[6].element[0] = form_dir.inputs[6].element[0].replace(/[0-9]/g,"");
                    if( form_dir.inputs[7].element[0].length != 0 )
                        form_dir.inputs[7].element[0] = form_dir.inputs[7].element[0].replace(/[^0-9]/g,"");

                    if( form_dir.inputs[0].element[0] == 1 ){
                        form_dir.inputs[1].items[0].forEach(function f_t(data){ if( data.id == form_dir.inputs[1].element[0] && data.id != '' ) text_final = `${data.name} ` } );
                        if( form_dir.inputs[2].element[0].length != 0 )text_final += `${form_dir.inputs[2].element[0]} `;
                        if( form_dir.inputs[3].element[0].length != 0 )text_final += `${form_dir.inputs[3].element[0]} `;
                        form_dir.inputs[4].items[0].forEach(function f_t(data){ if( data.id == form_dir.inputs[4].element[0] && data.id != '' ) text_final += `${data.name} ` } );
                        if( form_dir.inputs[5].element[0].length != 0 )text_final += `${form_dir.inputs[5].element[0]} `;
                        if( form_dir.inputs[6].element[0].length != 0 )text_final += `${form_dir.inputs[6].element[0]} `;
                        if( form_dir.inputs[7].element[0].length != 0 )text_final += `${form_dir.inputs[7].element[0]} `;
                        form_dir.inputs[8].items[0].forEach(function f_t(data){ if( data.id == form_dir.inputs[8].element[0] && data.id != '' ) text_final += `${data.name} ` } );

                        if( form_dir.inputs[9].element[0] == 1 )
                            if( form_dir.inputs[10].element[0].length != 0 )
                                text_final += `${form_dir.inputs[10].element[0]} `;
                    }else{
                        text_final +=  `${form_dir.inputs[10].element[0]} `;
                    }

                    form_dir.inputs[11].element[0] = text_final
                    form_dir.inputs[11].show = false;
                    form_dir.inputs[11].show = true;

                    input.element[0] = text_final
                    input.show = false;
                    input.show = true;
                }]},
            ],
            button:[]
        })

        $(".edit_direction h1").css("margin-top","30px")
    }else
        modal_direction.dialog = true
    
    loading(false)
}

function array_to_json_data( array ){
    let resturn_data = {};
    array.forEach(data => resturn_data[ data.col] = data.desc == null ? `${data.col.charAt(0).toUpperCase()}${data.col.slice(1)}`.replace(/[_-]/g," ") : data.desc );
    return resturn_data;
}