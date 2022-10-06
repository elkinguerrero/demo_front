"use strict";
let menu
$(document).ready(async function () {
    async function load_menu() {
        $("body").append(`
            <div id="menu">
                <template>
                    <v-app id="inspire">
                        <v-app-bar app :color="barra_fondo">
                            <v-app-bar-nav-icon @click="drawer = !drawer" :color="barra_color_text"></v-app-bar-nav-icon>
                            <v-img
                                max-height="30"
                                max-width="30"
                                :src="barra_ruta_imagen"
                                class="img_menu"
                                style="border-radius: 40px;"
                            ></v-img>
                            <v-toolbar-title :style="barra_color">
                                &nbsp;{{barra_titulo}}
                            </v-toolbar-title>

                            <v-spacer></v-spacer>

                            <v-menu left bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn icon v-bind="attrs" v-on="on">
                                        <v-icon :color="barra_color_text">mdi-account-circle</v-icon>
                                    </v-btn>
                                </template>

                                <v-card>
                                    <v-list>
                                        <v-list-item>
                                            <v-list-item-avatar>
                                                <img
                                                src="img/logo.png"
                                                :alt="usuario_nombre"
                                                >
                                            </v-list-item-avatar>
                                
                                            <v-list-item-content>
                                                <v-list-item-title>{{usuario_nombre}}</v-list-item-title>
                                                <v-list-item-subtitle>{{usuario_correo}}</v-list-item-subtitle>
                                            </v-list-item-content>
                                
                                            <v-list-item-action>
                                                <v-icon @click="salir">mdi-logout</v-icon>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>
                                </v-card>
                            </v-menu>
                        </v-app-bar>
            
                        <v-navigation-drawer v-model="drawer" fixed temporary>
                            <v-list-item class="px-2">
                                <div style="text-align: center;width: 100%;margin: 0 0 -15px 0;padding: 0;font-size: 25px;">Menu</div>
                            </v-list-item>

                            <v-divider></v-divider>

                            <span v-for="(rows, i) in v_menu.length">
                                <v-list-group v-if="v_menu[i].type=='menu_group'" v-model="v_menu[i].deploy" :prepend-icon="v_menu[i].icon" v-show="v_menu[i].show == undefined ? true : v_menu[i].show ">
                                    <template v-slot:activator>
                                        <v-list-item-title>{{v_menu[i].text}}{{v_menu[i].show}}</v-list-item-title>
                                    </template>
                                    <v-list-item link v-for="(rows, j) in v_menu[i].elements" v-on:click="menu(j,i)">
                                        <v-list-item-title>{{v_menu[i].elements[j].text}}</v-list-item-title>
                                        <v-list-item-icon>
                                            <v-icon>{{v_menu[i].elements[j].icon}}</v-icon>
                                        </v-list-item-icon>
                                    </v-list-item>
                                </v-list-group>
                                <v-list-item link v-if="v_menu[i].type=='menu'" v-on:click="menu(0,i)">
                                    <v-list-item-icon>
                                        <v-icon>{{v_menu[i].icon}}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>{{v_menu[i].text}}</v-list-item-title>
                                </v-list-item>
                            </span>
                        </v-navigation-drawer>
                    </v-app>
                </template>
            </div>
        `);

        menu =  new Vue({
            el: '#menu',
            vuetify: new Vuetify(),
            data() {
                return {
                    drawer: null,
                    usuario_nombre: "Demo",
                    usuario_correo: "demo@gmail.com",
                    barra_ruta_imagen: "../img/logo.png",
                    barra_titulo: "Demo",
                    barra_fondo: "#FFFFFF",
                    barra_color: "#000000",
                    barra_color_text: "#000000",
                    v_menu:[{
                        icon:"mdi-account-circle-outline",
                        text:"Usuarios",
                        deploy:false,
                        type:"menu_group",
                        elements:[{
                            icon:"mdi-account-plus-outline",
                            text:"Crear usuario",
                        },{
                            icon:"mdi-account-badge-outline",
                            text:"Consultar usuario",
                        }]
                    }],
                }
            },
            methods: {
                async menu( option, deploy ){
                    console.log( option, deploy );
                    $(".content_options").remove()
                    $("body").append(`<div class="content_options"></div>`)
                    set_variables_cache("option_selected",JSON.stringify({ option:option, deploy:deploy }))
                    if( option == 0 && deploy == 0 ){
                        //Crear usuario
                        this.v_menu[deploy].deploy = false;
                        this.drawer = false;
                        let form = create_form({
                            title:this.v_menu[deploy].elements[option].text,
                            title_icon:this.v_menu[deploy].elements[option].icon,
                            id_class:".content_options",
                            md:6, "offset-md":3,
                            inputs:[
                                {type:"text", md:6, "offset-md":3, label:"Nombre", counter:[100], element:[""]},
                                {type:"text", type_input: "number", md:6, "offset-md":3, label:"Cedula", element:[""]},
                                {type:"text", type_input: "date", md:6, "offset-md":3, label:"Fecha Nacimiento", element:[""]},
                            ],
                            button:[{
                                color:"primary",
                                label:"Crear",
                                md:6, "offset-md":3,
                                _function:async function(){
                                    if( valid_form(form) ){
                                        loading(true)
                                        form.f_action[0].loading = true;
                                        form.f_action[0].disabled = true;

										let set_user = await sendRequestPOST("/request/set_user", {
											nombre: form.inputs[0].element[0],
											cedula: form.inputs[1].element[0],
											fecha_nacimiento: form.inputs[2].element[0],
										}, 'application/json', false, "status")

                                        if( set_user.status == 1 ){
											alert(set_user.mensaje, "success", 5000)
                                            location.reload()

                                            clear_cache("inf_cache")
                                        }else {
                                            form.f_action[0].loading = false;
                                            form.f_action[0].disabled = false;
                                            alert(`Error interno contacte con el administrador: ${set_user.mensaje}`, "error", 5000)
                                        }

                                        loading(false)
                                    }
                                }
                            }]
                        })
                    }else if( option == 0 && deploy == 1 ){
                        $(".content_options").append(`
                            <div id="content_preview">
                                <v-app id="inspire">
                                    <div class="row">
                                        <div class="col-md-5 offset-md-1" style="margin-top: auto;">
                                            <h2>Barra de navegación</h2>
                                        </div>
                                        <div class="col-md-5">
                                            <v-card>
                                                <v-toolbar :color="barra_fondo">
                                                    <v-btn icon :color="barra_color_text">
                                                        <v-icon>mdi-menu</v-icon>
                                                    </v-btn>
                                                    <v-img
                                                        max-height="30"
                                                        max-width="30"
                                                        :src="barra_ruta_imagen"
                                                        style="border-radius: 40px;"
                                                    ></v-img>
                                                    <v-toolbar-title :style="barra_color">
                                                        &nbsp;{{barra_titulo}}
                                                    </v-toolbar-title>

                                                    <v-spacer></v-spacer>
                                                    <v-icon :color="barra_color_text" class="">mdi-account-circle</v-icon>
                                                </v-toolbar>
                                            </v-card>
                                        </div>
                                        
                                        <div class="col-md-10 offset-md-1"><hr></div>
                                        <div class="col-md-10 offset-md-1 col_1"></div>

                                        <div class="col-md-10 offset-md-1">
                                            <h2>Tipografia de la aplicación</h2>
                                        </div>

                                        <div class="col-md-2 offset-md-1" style="margin-top: auto;">
                                            <v-select
                                                v-model="v_tipos"
                                                :items="tipografia"
                                                label="Tipos"
                                                @change="c_tipo"
                                            ></v-select>
                                        </div>
                                        <div class="col-md-8 tipografia" style="margin-top: 20px"><div>Lorem Ipsum is simply dummy text of the printing</div></div>
                                        <div class="col-md-10 offset-md-1"><hr></div>
                                        <div class="col-md-10 offset-md-1 col_2"></div>
                                    </div>
                                </v-app>
                            </div>

                        `)

                        json_config.color = "#FFFFFF"
                        let config_result = new Vue({
                            el: `#content_preview`,
                            vuetify: new Vuetify(),
                            data() {
                                return { 
                                    barra_ruta_imagen: json_config != undefined && json_config.barra_ruta_imagen != undefined ? json_config.barra_ruta_imagen : "../img/logo.png",
                                    barra_titulo: json_config != undefined && json_config.barra_titulo != undefined ? json_config.barra_titulo : "App tramites",
                                    barra_fondo: json_config != undefined && json_config.barra_fondo != undefined ? json_config.barra_fondo : "#FFFFFF",
                                    barra_color: `color:${json_config != undefined && json_config.barra_color != undefined ? json_config.barra_color : "#000000"}`,
                                    barra_color_text: json_config != undefined && json_config.barra_color != undefined ? json_config.barra_color : "#000000",
                                    tipografia:["h1","h2","h3","h4","h5","h6","div","span"],
                                    v_tipos:"div"
                                }
                            },
                            methods:{
                                c_tipo(e){
                                    try {
                                        form_config2.get_info_id("tipografia").element[0] = json_config_letra[ config_result.v_tipos ].tipografia;
                                        form_config2.get_info_id("estilo").element[0] = json_config_letra[ config_result.v_tipos ].estilo;
                                        form_config2.get_info_id("negrilla").element[0] = json_config_letra[ config_result.v_tipos ].negrilla
                                        form_config2.get_info_id("espacio").element[0] = json_config_letra[ config_result.v_tipos ].espacio
                                    } catch (error) {
                                        form_config2.get_info_id("tipografia").element[0] = "";
                                        form_config2.get_info_id("estilo").element[0] = "";
                                        form_config2.get_info_id("negrilla").element[0] = ""
                                        form_config2.get_info_id("espacio").element[0] = ""
                                    }

                                    form_config2.get_info_id("espacio").show = !form_config2.get_info_id("espacio").show ;
                                    form_config2.get_info_id("espacio").show = !form_config2.get_info_id("espacio").show ;

                                    json_config_letra[ config_result.v_tipos ] = { 
                                        tipografia:form_config2.get_info_id("tipografia").element[0],
                                        estilo:form_config2.get_info_id("estilo").element[0],
                                        negrilla:form_config2.get_info_id("negrilla").element[0],
                                        espacio:form_config2.get_info_id("espacio").element[0],
                                    }

                                    $(`.tipografia`).html( `<${this.v_tipos}>Lorem Ipsum is simply dummy text of the printing</${this.v_tipos}>` )
                                    $(`.tipografia ${this.v_tipos}`).css({"font-style":json_config_letra[this.v_tipos].estilo, "font-family":json_config_letra[this.v_tipos].tipografia, "font-weight":json_config_letra[this.v_tipos].negrilla, "letter-spacing":`${json_config_letra[this.v_tipos].espacio}px`});
                                }
                            }
                        })

                        
                        let form_config = create_form({
                            id_class:".col_1",
                            inputs:[
                                { type:"file", md:4, id:["imagen_logo"], accept:[".jpg,.jpeg,.png,.gif"], label:["Imagen del logo"], _change: [async function(object){
                                    if( object.element[0] != null ){
                                        let reader = new FileReader();
                                        reader.readAsDataURL( object.element[0] );
                                        reader.onload = async function () { 
                                            config_result.barra_ruta_imagen = reader.result;
                                            console.log( form_config.get_info_id("color_titulo") )
                                        }
                                    }else
                                        config_result.barra_ruta_imagen = json_config != undefined && json_config.barra_ruta_imagen != undefined ? json_config.barra_ruta_imagen : "../img/logo.png";
                                }]},
                                { type:"text", md:4, id:"txt_tramite", label: ["Titulo"], element: json_config != undefined && json_config.barra_titulo != undefined ? json_config.barra_titulo : "App tramites", counter:20, _keyup(object){config_result.barra_titulo = object.element[0]}},
                                { type:"color", md:2, id:"color_titulo", element:json_config != undefined && json_config.barra_fondo != undefined ? json_config.barra_fondo : "#FFFFFF", label:"Fondo", _change(object){config_result.barra_fondo = object.element[0]}},
                                { type:"color",md:2, id:"color_texto", label:"Texto", element:json_config != undefined && json_config.barra_color != undefined ? json_config.barra_color : "#000000", _change(object){
                                    config_result.barra_color = `color:${object.element[0]}`;
                                    config_result.barra_color_text = object.element[0];
                                }},
                            ],
                            button:[{
                                color:"primary",
                                label:"Guardar",
                                md:4, "offset-md":8,
                                async _function(){
                                    loading(true)

                                    if( form_config.get_info_id("imagen_logo").element[0] != null && form_config.get_info_id("imagen_logo").element[0].length !=  0 ){
                                        let reader = new FileReader();
                                        reader.readAsDataURL( form_config.get_info_id("imagen_logo").element[0] );
                                        reader.onload = async function () { 
                                            let json_config = { 
                                                barra_ruta_imagen:reader.result,
                                                barra_titulo:form_config.get_info_id("txt_tramite").element[0],
                                                barra_fondo:form_config.get_info_id("color_titulo").element[0],
                                                barra_color:form_config.get_info_id("color_texto").element[0]
                                            }
    
                                            let response = await sendRequestPOST("/request/set_json_confg", {info_data:"json_config", json_data:JSON.stringify(json_config)}, 'application/json', true, "status" )
                                            if( response.status == 1 )
                                                alert( response.mensaje, "success", 5000 )
    
                                            clear_cache("inf_cache")
                                            location.reload()
                                        }
                                    }else{
                                        let json_config2 = { 
                                            barra_ruta_imagen:json_config != undefined && json_config.barra_ruta_imagen != undefined ? json_config.barra_ruta_imagen : "../img/logo.png",
                                            barra_titulo:form_config.get_info_id("txt_tramite").element[0],
                                            barra_fondo:form_config.get_info_id("color_titulo").element[0],
                                            barra_color:form_config.get_info_id("color_texto").element[0]
                                        }

                                        let response = await sendRequestPOST("/request/set_json_confg", {info_data:"json_config", json_data:JSON.stringify(json_config2)}, 'application/json', true, "status" )
                                        if( response.status == 1 )
                                            alert( response.mensaje, "success", 5000 )

                                        clear_cache("inf_cache")
                                        location.reload()
                                    }
                                    
                                    loading(false)
                                }}]
                        })

                        let form_config2 = create_form({
                            id_class:".col_2",
                            inputs:[
                                { type:"select", md:3, id:"tipografia", label: "Fuente", items:[
                                    { id:"Arial, sans-serif" ,name:"Arial, sans-serif" },
                                    { id:"Helvetica, sans-serif" ,name:"Helvetica, sans-serif" },
                                    { id:"Verdana, sans-serif" ,name:"Verdana, sans-serif" },
                                    { id:"Trebuchet MS, sans-serif" ,name:"Trebuchet MS, sans-serif" },
                                    { id:"Gill Sans, sans-serif" ,name:"Gill Sans, sans-serif" },
                                    { id:"Noto Sans, sans-serif" ,name:"Noto Sans, sans-serif" },
                                    { id:"Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif" ,name:"Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif" },
                                    { id:"Optima, sans-serif" ,name:"Optima, sans-serif" },
                                    { id:"Arial Narrow, sans-serif" ,name:"Arial Narrow, sans-serif" },
                                    { id:"sans-serif" ,name:"sans-serif" },
                                    { id:"Times, Times New Roman, serif" ,name:"Times, Times New Roman, serif" },
                                    { id:"Didot, serif" ,name:"Didot, serif" },
                                    { id:"Georgia, serif" ,name:"Georgia, serif" },
                                    { id:"Palatino, URW Palladio L, serif" ,name:"Palatino, URW Palladio L, serif" },
                                    { id:"Bookman, URW Bookman L, serif" ,name:"Bookman, URW Bookman L, serif" },
                                    { id:"New Century Schoolbook, TeX Gyre Schola, serif" ,name:"New Century Schoolbook, TeX Gyre Schola, serif" },
                                    { id:"American Typewriter, serif" ,name:"American Typewriter, serif" },
                                    { id:"serif" ,name:"serif" },
                                    { id:"Andale Mono, monospace" ,name:"Andale Mono, monospace" },
                                    { id:"Courier New, monospace" ,name:"Courier New, monospace" },
                                    { id:"Courier, monospace" ,name:"Courier, monospace" },
                                    { id:"FreeMono, monospace" ,name:"FreeMono, monospace" },
                                    { id:"OCR A Std, monospace" ,name:"OCR A Std, monospace" },
                                    { id:"DejaVu Sans Mono, monospace" ,name:"DejaVu Sans Mono, monospace" },
                                    { id:"monospace" ,name:"monospace" },
                                    { id:"Comic Sans MS, Comic Sans, cursive" ,name:"Comic Sans MS, Comic Sans, cursive" },
                                    { id:"Apple Chancery, cursive" ,name:"Apple Chancery, cursive" },
                                    { id:"Bradley Hand, cursive" ,name:"Bradley Hand, cursive" },
                                    { id:"Brush Script MT, Brush Script Std, cursive" ,name:"Brush Script MT, Brush Script Std, cursive" },
                                    { id:"Snell Roundhand, cursive" ,name:"Snell Roundhand, cursive" },
                                    { id:"URW Chancery L, cursive" ,name:"URW Chancery L, cursive" },
                                    { id:"cursive" ,name:"cursive" },
                                    { id:"Impact, fantasy" ,name:"Impact, fantasy" },
                                    { id:"Luminari, fantasy" ,name:"Luminari, fantasy" },
                                    { id:"Chalkduster, fantasy" ,name:"Chalkduster, fantasy" },
                                    { id:"Jazz LET, fantasy" ,name:"Jazz LET, fantasy" },
                                    { id:"Blippo, fantasy" ,name:"Blippo, fantasy" },
                                    { id:"Stencil Std, fantasy" ,name:"Stencil Std, fantasy" },
                                    { id:"Marker Felt, fantasy" ,name:"Marker Felt, fantasy" },
                                    { id:"Trattatello, fantasy" ,name:"Trattatello, fantasy" },
                                    { id:"fantasy" ,name:"fantasy" },
                                ],_change(object){
                                    $(`.tipografia ${config_result.v_tipos}`).css({"font-family":object.element[0]});
                                    json_config_letra[ config_result.v_tipos ] = { 
                                        tipografia:form_config2.get_info_id("tipografia").element[0],
                                        estilo:form_config2.get_info_id("estilo").element[0],
                                        negrilla:form_config2.get_info_id("negrilla").element[0],
                                        espacio:form_config2.get_info_id("espacio").element[0],
                                    }
                                }},{ type:"select", md:3, id:"estilo", label: "Estilo", items:[
                                    { id:"normal" ,name:"normal" },
                                    { id:"italic" ,name:"italic" },
                                    { id:"oblique" ,name:"oblique" },
                                ],_change(object){
                                    $(`.tipografia ${config_result.v_tipos}`).css({"font-style":object.element[0]});
                                    json_config_letra[ config_result.v_tipos ] = { 
                                        tipografia:form_config2.get_info_id("tipografia").element[0],
                                        estilo:form_config2.get_info_id("estilo").element[0],
                                        negrilla:form_config2.get_info_id("negrilla").element[0],
                                        espacio:form_config2.get_info_id("espacio").element[0],
                                    }
                                }},{ type:"select", md:3, id:"negrilla", label: "Negrilla", items:[
                                    { id:"100" ,name:"100" },
                                    { id:"200" ,name:"200" },
                                    { id:"300" ,name:"300" },
                                    { id:"normal" ,name:"normal" },
                                    { id:"500" ,name:"500" },
                                    { id:"600" ,name:"600" },
                                    { id:"bold" ,name:"bold" },
                                    { id:"800" ,name:"800" },
                                    { id:"900" ,name:"900" },
                                ],_change(object){
                                    $(`.tipografia ${config_result.v_tipos}`).css({"font-weight":object.element[0]});
                                    json_config_letra[ config_result.v_tipos ] = { 
                                        tipografia:form_config2.get_info_id("tipografia").element[0],
                                        estilo:form_config2.get_info_id("estilo").element[0],
                                        negrilla:form_config2.get_info_id("negrilla").element[0],
                                        espacio:form_config2.get_info_id("espacio").element[0],
                                    }
                                }},{ type:"text", type_input: "number", md:3, id:"espacio", label: "Espacio entre letras",_keyup(object){
                                    $(`.tipografia ${config_result.v_tipos}`).css({"letter-spacing":`${object.element[0]}px`});
                                    json_config_letra[ config_result.v_tipos ] = { 
                                        tipografia:form_config2.get_info_id("tipografia").element[0],
                                        estilo:form_config2.get_info_id("estilo").element[0],
                                        negrilla:form_config2.get_info_id("negrilla").element[0],
                                        espacio:form_config2.get_info_id("espacio").element[0],
                                    }
                                }},
                            ],
                            button:[{
                                color:"primary",
                                label:"Guardar",
                                md:4, "offset-md":8,
                                async _function(){
                                    loading(true)
                                    let response = await sendRequestPOST("/request/set_json_confg", {info_data:"json_config_letra", json_data:JSON.stringify(json_config_letra)}, 'application/json', true, "status" )
                                    if( response.status == 1 )
                                        alert( response.mensaje, "success", 5000 )
                                    
                                    loading(false)
                                }}]
                        })

                        try{
                            json_config_letra = await sendRequestGET("/request/get_config_info_data?info_data=json_config_letra", false, 'application/json')
                            json_config_letra = JSON.parse( decodeURIComponent(json_config_letra[0].json_data) )
                            try {
                                $(`.tipografia ${config_result.v_tipos}`).css({"font-style":json_config_letra[config_result.v_tipos].estilo, "font-family":json_config_letra[config_result.v_tipos].tipografia, "font-weight":json_config_letra[config_result.v_tipos].negrilla, "letter-spacing":`${json_config_letra[config_result.v_tipos].espacio}px`});

                                form_config2.get_info_id("tipografia").element[0] = json_config_letra[config_result.v_tipos].tipografia;
                                form_config2.get_info_id("estilo").element[0] = json_config_letra[config_result.v_tipos].estilo;
                                form_config2.get_info_id("negrilla").element[0] = json_config_letra[config_result.v_tipos].negrilla
                                form_config2.get_info_id("espacio").element[0] = json_config_letra[config_result.v_tipos].espacio

                                form_config2.get_info_id("espacio").show = !form_config2.get_info_id("espacio").show ;
                                form_config2.get_info_id("espacio").show = !form_config2.get_info_id("espacio").show ;
                            } catch (error) {
                                
                            }
                            
                        }catch(e){}
                        
                        
                    }else if( option == 1 && deploy == 0 ){
                        let users = await sendRequestGET("/request/get_users", false, 'application/json')
                        let headers = []

                        for( let i=0; i<users.length; i++ ){
                            if( i==0 )
                            for( let key in users[i] )
                                if( key != 'id' && key != 'status' )
                                    headers.push({ text: key, value: key})

                            users[i].icon = [];
                            users[i].color = [];
                            users[i].icon[0] = "mdi-trash-can"
                            users[i].color[0] = "black"

                            users[i].fecha_nacimiento = users[i].fecha_nacimiento.split("T")[0]
                        }
                            
                        
                        create_table({ 
                            id_class:".content_options",
                            headers:headers, 
                            desserts:users,
                            title:this.v_menu[deploy].elements[option].text,
                            title_icon:this.v_menu[deploy].elements[option].icon,
                            _click:[
                                {text:"Eliminar" ,function:async function(element){
                                    console.log( element )
                                    if (confirm(`Esta seguro que desea eliminar el usuario ${element.nombre}`) == true){
                                        loading(true)
                                        let request_aprobar = await sendRequestPOST("/request/delete_user", {id:element.id}, 'application/json', false, "status")
                                        if( request_aprobar.status == 1 ){
                                            alert( request_aprobar.mensaje, "success", 5000 )
                                            menu.menu( 1, 0 )
                                        }else{
                                            alert( request_aprobar.mensaje, "error", 5000 )
                                        }
                                        loading(false)
                                    }
                                }}
                            ]
                        })
                    }
                },
                salir(){
                    alert("Ha salido del sistema, acción en desarrollo","success",5000)
                }
            },
            mounted() {
                let selection = JSON.parse( get_variables_cache("option_selected") )
                if( selection != null )
                    this.menu( selection.option, selection.deploy )
                else
                    this.menu( 1, 0 )
                loading(false)
            }
        })
    }

    load_menu();
})