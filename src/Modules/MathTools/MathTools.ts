import Discord, { ApplicationCommand } from "discord.js";
import { Access, InteractiveCommand, InteractiveSlashCommand, Module, RainbowBOT, RainbowBOTUserError } from "rainbowbot-core";
import { create, all, } from "mathjs";
import { Canvas, createCanvas } from "canvas";
import _ from "lodash";
import { ContextMenuCommandBuilder } from "@discordjs/builders";

export default class MathTools extends Module{
    public Name:        string = "MathTools";
    public Description: string = "Using this command you can do some mathematical stuff.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ]

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);

        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand("math", this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription("Math functions, constants, and other useful stuff. Use `/math commands` to view list of commands.")
                
                .addSubcommand(scmd => scmd
                    .setName("commands")
                    .setDescription("List of all commands.")
                )

                .addSubcommand(scmd => scmd
                    .setName("eval")
                    .setDescription("Evaluate mathematical expression.")
                    .addStringOption(opt => opt
                        .setName("expr")
                        .setDescription("Mathematical expression.")
                        .setRequired(true)   
                    )
                )

                .addSubcommand(scmd => scmd
                    .setName("graph")
                    .setDescription("Draw graph by math expression.")
                    .addStringOption(opt => opt
                        .setName("expr")
                        .setDescription("Mathematical expression.")
                        .setRequired(true)
                    )
                    .addNumberOption(opt => opt
                        .setName("zoom")
                        .setDescription("Zoom factor.")
                    )
                    .addNumberOption(opt => opt
                        .setName("res")
                        .setDescription("Resolution")
                    )
                )

                .addSubcommandGroup(scg => scg
                    .setName("arithmetics")
                    .setDescription("Arithmetic functions.")

                    .addSubcommand(scmd => scmd
                        .setName("add")
                        .setDescription("Returns sum of two numbers.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Fist number.") 
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("y")
                            .setDescription("Second number.") 
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("sub")
                        .setDescription("Returns difference of two numbers.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Fist number.") 
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("y")
                            .setDescription("Second number.") 
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("mul")
                        .setDescription("Returns product of two numbers.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Fist number.") 
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("y")
                            .setDescription("Second number.") 
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("div")
                        .setDescription("Returns division of two numbers.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Fist number.") 
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("y")
                            .setDescription("Second number.") 
                            .setRequired(true)
                        )
                    )

                )

                .addSubcommandGroup(scg => scg
                    .setName("trigonometry")
                    .setDescription("Trigonometric functions.")

                    .addSubcommand(scmd => scmd
                        .setName("cos")
                        .setDescription("Returns cosine of the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Angle in radians.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("sin")
                        .setDescription("Returns sine of the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Angle in radians.")    
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("tan")
                        .setDescription("Returns tangent of the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Angle in radians.")    
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("arccos")
                        .setDescription("Returns angle of the cosine.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Cosine (-1 ; 1).")
                            .setMaxValue(1)
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("arcsin")
                        .setDescription("Returns angle of the sine.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Sine (-1 ; 1).")
                            .setMaxValue(1)
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("arctan")
                        .setDescription("Returns angle of the tangent.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Tangent.")
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("pow")
                        .setDescription("Returns the value of a base expression taken to a specified power.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Base value.") 
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("y")
                            .setDescription("Power.") 
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("sqrt")
                        .setDescription("Returns square root of the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber to take square root from.")
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("cbrt")
                        .setDescription("Returns cube root of the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber to take cube root from.")
                            .setRequired(true)
                        )
                    )
                    
                    .addSubcommand(scmd => scmd
                        .setName("log")
                        .setDescription("Returns natural logarithm of the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber to take natural logarithm from. (x > 0)")
                            .setMinValue(0)
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("log2")
                        .setDescription("Returns logarithm of base 2 from the number.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber to take logarithm of base 2 from. (x > 0)")
                            .setMinValue(0)
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("log10")
                        .setDescription("Returns logarithm of base 10 from the number. (x > 0)")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber to take logarithm of base 10 from.")
                            .setMinValue(0)
                            .setRequired(true)
                        )
                    )
                )


                .addSubcommandGroup(scg => scg
                    .setName("constants")
                    .setDescription("Mathematical constants.")

                    .addSubcommand(scmd => scmd
                        .setName("pi")
                        .setDescription("Returns Pi const.")
                    )
                    .addSubcommand(scmd => scmd
                        .setName("e")
                        .setDescription("Returns Euler's number const.")
                    )
                )


                .addSubcommandGroup(scg => scg
                    .setName("converters")
                    .setDescription("Some converters.")

                    .addSubcommand(scmd => scmd
                        .setName("deg2rad")
                        .setDescription("Converts degrees to radians.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber of degrees.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("rad2deg")
                        .setDescription("Converts radians to degrees.")
                        .addNumberOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber of radians.")
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("bin2dec")
                        .setDescription("Converts binary representation of number to decimal.")
                        .addStringOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber in binary representation.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("dec2bin")
                        .setDescription("Converts decimal representation of number to binary.")
                        .addIntegerOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber in decimal representation.")
                            .setMinValue(0)
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("hex2dec")
                        .setDescription("Converts hexadecimal representation of number to decimal.")
                        .addStringOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber in hexadecimal representation.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("dec2hex")
                        .setDescription("Converts decimal representation of number to hexadecimal.")
                        .addIntegerOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber in decimal representation.")
                            .setMinValue(0)
                            .setRequired(true)
                        )
                    )
    
                    .addSubcommand(scmd => scmd
                        .setName("hex2bin")
                        .setDescription("Converts hexadecimal representation of number to binary.")
                        .addStringOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber in hexadecimal representation.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(scmd => scmd
                        .setName("bin2hex")
                        .setDescription("Converts binary representation of number to hexadecimal.")
                        .addStringOption(opt => opt
                            .setName("x")
                            .setDescription("Nuber in binary representation.")
                            .setRequired(true)
                        )
                    )

                ) 

                .addSubcommandGroup(scg => scg
                    .setName("utils")
                    .setDescription("Some utils.")

                    .addSubcommand(scmd => scmd
                        .setName("random")
                        .setDescription("Returns random number between 0 and 1.")
                    )
                )
            )
            .onExecute(this.Run.bind(this))
            .commit(),
        );
    }

    private makeMessage(answ: string, tool: string){
        return new Discord.MessageEmbed()
            .setTitle(`MathTools - ${tool}`)
            .setDescription("\`\`\`" + answ + "\`\`\`")
            .setColor(0x1483de);
    }
    
    public async Run(interaction: Discord.CommandInteraction){
        let subcmd = interaction.options.getSubcommand(true);
        
        switch(subcmd){
            case "add":{
                let x = interaction.options.getNumber("x", true);
                let y = interaction.options.getNumber("y", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} + ${y} = ${x + y}`, "Addition") ] });
            }
            case "sub":{
                let x = interaction.options.getNumber("x", true);
                let y = interaction.options.getNumber("y", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} - ${y} = ${x - y}`, "Subtraction") ] });
            }
            case "mul":{
                let x = interaction.options.getNumber("x", true);
                let y = interaction.options.getNumber("y", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} * ${y} = ${x * y}`, "Multiplication") ] });
            }
            case "div":{
                let x = interaction.options.getNumber("x", true);
                let y = interaction.options.getNumber("y", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} / ${y} = ${x / y}`, "Division") ] });
            }
            case "e":{
                return interaction.reply({ embeds: [ this.makeMessage(`Euler's number is ${Math.E}`, "Euler's number") ] });
            }
            case "pi":{
                return interaction.reply({ embeds: [ this.makeMessage(`Pi is ${Math.PI}`, "PI") ] });
            }
            case "cos":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Cosine of ${x} is ${Math.cos(x)}`, "Cosine") ] });
            }
            case "sin":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Sine of ${x} is ${Math.sin(x)}`, "Sine") ] });
            }
            case "tan":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Tangent of ${x} is ${Math.tan(x)}`, "Tangent") ] });
            }
            case "arccos":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Angle of cos(${x}) is ${Math.acos(x)}`, "ArcCosine") ] });
            }
            case "arcsin":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Angle of sin(${x}) is ${Math.asin(x)}`, "ArcSine") ] });
            }
            case "arctan":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Angle of tan(${x}) is ${Math.atan(x)}`, "ArcTangent") ] });
            }
            case "pow":{
                let x = interaction.options.getNumber("x", true);
                let y = interaction.options.getNumber("y", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} in power of ${y} is ${Math.pow(x, y)}`, "Power") ] });
            }
            case "sqrt":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Square root of ${x} is ${Math.sqrt(x)}`, "SquareRoot") ] });
            }
            case "cbrt":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Cube root of ${x} is ${Math.cbrt(x)}`, "CubeRoot") ] });
            }
            case "log":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Natural logarithm of ${x} is ${Math.log(x)}`, "LOG") ] });
            }
            case "log2":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Logarithm with base 2 of ${x} is ${Math.log2(x)}`, "LOG2") ] });
            }
            case "log10":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`Logarithm with base 10 of ${x} is ${Math.log10(x)}`, "LOG10") ] });
            }
            case "random":{
                return interaction.reply({ embeds: [ this.makeMessage(`Random number is ${Math.random()}`, "Random") ] });
            }
            case "deg2rad":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} degrees = ${x * 0.0174533} radians`, "DegreesToRadians") ] });
            }
            case "rad2deg":{
                let x = interaction.options.getNumber("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} radians = ${x * 57.2958} degrees`, "RadiansToDegrees") ] });
            }
            case "bin2dec":{
                let x = interaction.options.getString("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`0b${x} = ${parseInt(x, 2)}`, "BinaryToDecimal") ] });
            }
            case "dec2bin":{
                let x = interaction.options.getInteger("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} = 0b${x.toString(2)}`, "DecimalToBinary") ] });
            }
            case "hex2dec":{
                let x = interaction.options.getString("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`0x${x} = ${parseInt(x, 16)}`, "HexadecimalToDecimal") ] });
            }
            case "dec2hex":{
                let x = interaction.options.getInteger("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`${x} = 0x${x.toString(16)}`, "DecimalToHexadecimal") ] });
            }
            case "hex2bin":{
                let x = interaction.options.getString("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`0x${x} = 0b${parseInt(x, 16).toString(2)}`, "HexadecimalToBinary") ] });
            }
            case "bin2hex":{
                let x = interaction.options.getString("x", true);
                return interaction.reply({ embeds: [ this.makeMessage(`0b${x} = 0x${parseInt(x, 2).toString(16)}`, "BinaryToHexadecimal") ] });
            }
            case "eval":{
                const math = create(all)
                const limitedEvaluate = math.evaluate

                math.import({
                    import: function () { throw new RainbowBOTUserError('Function import is disabled') },
                    createUnit: function () { throw new RainbowBOTUserError('Function createUnit is disabled') },
                    evaluate: function () { throw new RainbowBOTUserError('Function evaluate is disabled') },
                    parse: function () { throw new RainbowBOTUserError('Function parse is disabled') },
                    simplify: function () { throw new RainbowBOTUserError('Function simplify is disabled') },
                    derivative: function () { throw new RainbowBOTUserError('Function derivative is disabled') }
                }, { override: true })
                let expr = interaction.options.getString("expr", true);
                let result;
                try {
                    result = limitedEvaluate(expr);
                } catch (err: any) {
                    throw new RainbowBOTUserError("Error parsing expression:", err?.message || undefined)
                }
                return interaction.reply({ embeds: [ this.makeMessage(`${expr} = ${result}`, "Math Expression") ] });
            }
            case "graph":{
                await interaction.deferReply();
                const math = create(all)
                math.import({
                    import: function () { throw new RainbowBOTUserError('Function import is disabled') },
                    createUnit: function () { throw new RainbowBOTUserError('Function createUnit is disabled') },
                    evaluate: function () { throw new RainbowBOTUserError('Function evaluate is disabled') },
                    simplify: function () { throw new RainbowBOTUserError('Function simplify is disabled') },
                    derivative: function () { throw new RainbowBOTUserError('Function derivative is disabled') }
                }, { override: true })
                let expr = interaction.options.getString("expr", true).split(";;");
                let compiled = [];
                for(let e of expr){
                    try {
                        compiled.push(math.compile(e));
                    } catch (err: any) {
                        throw new RainbowBOTUserError("Error parsing expression:", err?.message || undefined)
                    }
                }

                let zoom = interaction.options.getNumber("zoom") || 10;
                let resolution = interaction.options.getNumber("res") || 1000;

                resolution = resolution > 200000 ? 200000 : resolution;

                let width = 1000;
                let height = 1000;
                
                let canvas = MathTools.prepareCanvas(width, height, zoom);

                let colors = [ "#0000FF", "#00FF00", "#FF0000" ]
                for(let c of compiled.slice(0, 3)){
                    await MathTools.drawMathCurve(canvas, c, colors.pop()!, zoom, resolution);
                }

                let img = new Discord.MessageAttachment(canvas.toBuffer("image/png"), "graph.png");
                await interaction.editReply({ embeds: [ this.makeMessage(`${expr}\`\`\`\nIf  you have visual artifacts just increase resolution (max 200000). You can also put up to 3 expressions separated by ";;"\`\`\``, "Graph").setImage('attachment://graph.png') ], files: [ img ] });
                return;
            }
            default:{
                let tools = {
                    arithm: [
                        "add",
                        "sub",
                        "mul",
                        "div"
                    ],
                    trigonom: [
                        "cos",
                        "sin",
                        "tan",
                        "arccos",
                        "arcsin",
                        "arctan",
                        "pow",
                        "sqrt",
                        "cbrt",
                        "log",
                        "log2",
                        "log10"
                    ],
                    const: [
                        "pi",
                        "e"
                    ],
                    conv: [
                        "deg2rad",
                        "rad2deg",
                        "bin2dec",
                        "dec2bin",
                        "hex2dec",
                        "dec2hex",
                        "hex2bin",
                        "bin2hex"
                    ],
                    utils: [
                        "random"
                    ]
                }
                return interaction.reply({ embeds: [ 
                    this.makeMessage(   `/math commands\n` +
                                        `/math eval\n` +
                                        `/math graph\n\n` +
                                        `/math arithmetics <...>:\n\t${tools.arithm.join("\n\t")}\n\n` +
                                        `/math trigonometry <...>:\n\t${tools.trigonom.join("\n\t")}\n\n` +
                                        `/math constants <...>:\n\t${tools.const.join("\n\t")}\n\n` +
                                        `/math converters <...>:\n\t${tools.conv.join("\n\t")}\n\n` +
                                        `/math utils <...>:\n\t${tools.utils.join("\n\t")}\n\n`, 
                    "List of tools") 
                ]});
            }
        }
    }

    public static prepareCanvas(width: number, height: number, zoom: number){
        let x0 = Math.floor(width / 2);
        let y0 = Math.floor(height / 2);

        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext("2d");
        
        let x_start = -x0 / zoom;
        let x_end = (canvas.width - x0) / zoom;
        
        let y_start = -y0 / zoom;
        let y_end = (canvas.height - y0) / zoom;
                
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.textAlign = "right";
        let base_scale = 25 / zoom;
        let x = x_start;
        while(x <= x_end){
            let x1 = Math.trunc(x * zoom) + x0;
            ctx.beginPath();
            ctx.moveTo(x1, 0);
            ctx.lineTo(x1, height);
            if(x % (base_scale*4) === 0){
                ctx.strokeStyle = "#000000";
                ctx.strokeText(x.toString(), x1-5, y0-5);
            }else{
                ctx.strokeStyle = "#999999";
            }
            ctx.stroke();
        	x += base_scale;
        }
        
        let y = y_start;
        while(y <= y_end){
            let y1 = Math.trunc(-y * zoom) + y0;
            ctx.beginPath();
            ctx.moveTo(0, y1);
            ctx.lineTo(width, y1);
            if(y % (base_scale*4) === 0){
                ctx.strokeStyle = "#000000";
                ctx.strokeText(y.toString(), x0-5, y1-5);
            }else{
                ctx.strokeStyle = "#999999";
            }
            ctx.stroke();
            y += base_scale;
        }

        ctx.strokeStyle = "#000000";
        ctx.moveTo(0, y0);
        ctx.lineTo(width, y0);
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, height);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
        return canvas;
    }

    public static async drawMathCurve(canvas: Canvas, math_expr: math.EvalFunction, color: string, zoom: number, resolution: number){
        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        let x0 = Math.floor(canvas.width / 2);
        let y0 = Math.floor(canvas.height / 2);

        let zfactor = canvas.width / zoom;
        let h = zfactor / resolution;

        let x_start = -x0 / zoom;
        let x_end = (canvas.width - x0) / zoom;
        
        let x = x_start;
        let scope = { x, y: 0 };
        let out_of_bounds_flag = true;
        let func_gap = false;

        ctx.beginPath();
        while(x <= x_end){
            scope.x = x;
            try {
                math_expr.evaluate(scope);
            } catch (err: any) {
                throw new RainbowBOTUserError("Error parsing expression:", err?.message || undefined)
            }
            let y = scope.y;
            if(isNaN(y) || y === undefined){
                func_gap = true;
            }
        
            if(func_gap){
                while((isNaN(y) || y === undefined) && x <= x_end){
                    x += h;
                    scope.x = x;
                    try {
                        math_expr.evaluate(scope);
                    } catch (err: any) {
                        throw new RainbowBOTUserError("Error parsing expression:", err?.message || undefined)
                    }
                    y = scope.y;
                }
                func_gap = false;
                let x1 = Math.trunc(x * zoom) + x0;
                let y1 = Math.trunc(-y * zoom) + y0;
                ctx.moveTo(x1, y1);
                func_gap = false;
                x += h;
                continue;
            }

            let x1 = Math.trunc(x * zoom) + x0;
            let y1 = Math.trunc(-y * zoom) + y0;
    
            if(y1 < 0){
                ctx.lineTo(x1, 0);
                out_of_bounds_flag = true;
            }else if(y1 > canvas.height){
                ctx.lineTo(x1, canvas.height); 
                out_of_bounds_flag = true;
            }

            if(out_of_bounds_flag){
                while((y1 < 0 || y1 > canvas.height) && x <= x_end){
                    x += h;
                    scope.x = x;
                    try {
                        math_expr.evaluate(scope);
                    } catch (err: any) {
                        throw new RainbowBOTUserError("Error parsing expression:", err?.message || undefined)
                    }
                    y = scope.y;
                    y1 = Math.trunc(-y * zoom) + y0;
                }
                x1 = Math.trunc(x * zoom) + x0;
                ctx.moveTo(x1, y1);
                out_of_bounds_flag = false;
            }else{
                ctx.lineTo(x1, y1);
            }
            x += h;
        }
        ctx.stroke();
        ctx.strokeStyle = "#525252";
        ctx.lineWidth = 1;
        return canvas;
    }
}