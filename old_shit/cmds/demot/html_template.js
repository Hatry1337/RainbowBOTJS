module.exports = `
<!DOCTYPE html>
<html>
    <body style="background-color: #000;">
        <style>
            #demotivator {
                background-color: #000; 
                text-align: center; 
                margin: 0 auto;
            }
            .dem_work { padding-left: 46px; padding-right: 46px; }
            #title_text {
                border: 0;
                resize: none;
                color: white;
                text-align: center;

                font-family: times new roman;
                font-size: 72px;
                line-height: 1;
                margin: 0 auto;
            }

            #text_text{
                background-color: #000;
                border: 0;
                resize: none;
                color: white;
                text-align: center;

                font-family: sans-serif;
                margin: 0 auto;
                font-size: 25px;
            }

            #dem_image {height: 70%; }
            #dem_image_div { display: inline-block; border: 3px solid white; padding: 4px; margin-top: 35px; margin-bottom: 9px;}
            #dem_title {height: 70px; position: relative;}
            #dem_text {vertical-align: top; padding-top: 5px; padding-bottom: 20px;}
        </style>
        <table id="demotivator" class="dem_work">
            <tbody>
                <tr>
                    <td id="dem_image">
                        <div id="dem_image_div" class="dropzone " style="position: relative; ">
                            <div id="for_image" class="togg">
                                <img id="dem_pic" style="max-width: 608px; max-height: 630px;" src="{{IMAGE_URL}}">
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td id="dem_title">
                        <div id="title_text" style="width: 583.828px; font-size: {{TITLE_F_SIZE}};">{{TITLE_TEXT}}</div>
                    </td>
                </tr>
                <tr>
                    <td id="dem_text">
                        <div id="text_text" style="width: 583.828px; font-size: {{TEXT_F_SIZE}}">{{TEXT_TEXT}}</div>            
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>
`