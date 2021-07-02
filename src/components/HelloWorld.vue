<template>

  <div class="hello">
    <div>
      <div class="header_border">
        <h2>Tim Reynolds</h2>
      </div>
      <div>
        <img :src="require('@/assets/fullname-qrcode.png')" style="padding: 5px 0 0 0; width:100px; height:100px;">
      </div>
    </div>

    <div class="header_border">
      <h2>Cryptocurrencies</h2>
    </div>

    <div id="tezos_display">
      <h3>Tezos</h3>
        <div id="tezos_price" class="crypto_price"></div>
        <div id="tezos_qrcode_frame">          
          <img id="tezos_logo" :src="require('@/assets/tezos_logo.png')">
          <!-- <img id="tezos_logo" src="https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png"> -->
        </div>

    </div>

    <div id="burst_display">
        <h3>Burst</h3>
        <div id="burst_price" class="crypto_price"></div>
        <div id="burst_qrcode_frame">
          <img id="burst_logo" :src="require('@/assets/burst_logo.png')">
          <!-- <img id="burst_logo" src="https://cryptologos.cc/logos/burst-burst-logo.png?v=010"> -->
        </div>
    </div>

    <div id="algorand_display">
      <h3>Algorand</h3>
      <div id="algo_price" class="crypto_price"></div>
      <div id="algo_qrcode_frame">
        <img id="algo_logo" :src="require('@/assets/algo_logo.png')">
        <!-- <img id="algo_logo" src="https://dl.airtable.com/.attachmentThumbnails/263ef9f20a2f2773a0d35ad2be9b5ade/b80ce5fe"> -->
      </div>
    </div>

    <div class="header_border">
      <h2>Twitter Feeds</h2>
    </div>

    <ul>
      <li>
        <h3>BBC Africa</h3>
        <span>
          <TwitterFeed src="https://twitter.com/BBCAfrica?ref_src=twsrc%5Etfw"></TwitterFeed>
        </span>
      </li>
      <li style="vertical-align: top;">
        <h3>Ethereum</h3>
        <span>
          <TwitterFeed src="https://twitter.com/ethereum?ref_src=twsrc%5Etfw"></TwitterFeed>
        </span>
      </li>
    </ul>
    
    <div class="header_border">
      <h2>
        Portfolio Links
      </h2>
    </div>

    <ul>
      <li>
        <a href="https://github.com/tmrdev" target="_blank" rel="noopener">github</a> |
      </li>
      <li>
        <a href="https://www.linkedin.com/in/tmrdev/" target="_blank" rel="noopener">linkedin</a> |
      </li>
      <li>
        <a href="https://timreynolds.org/" target="_blank" rel="noopener">profile</a> |
      </li>
      <li>
        <a href="mailto:tim@electrixsheep.com" rel="noopener">tim@electrixsheep.com</a> |
      </li>
      <li>
        <a href="https://timreynolds.org/resume/" target="_blank" rel="noopener">resume</a>
      </li>
    </ul> 

    <div class="header_border">
      <h2>Screenshot/Email</h2>
    </div>
    <div class="screenshot_footer">
      <button class="button_inner_shadow" type="button" name="button" v-on:click="screenshot">Screenshot</button>
    </div>

    <div class="screenshot_footer" style="padding: 0 0 25px 0">
      <form v-on:submit.prevent="onSubmit">
        <h3>Enter email address for emailing screenshot (Screenshot Should Be Saved In ~/Downloads as electron-screenshot.png)</h3>
        <input v-model="emailaddress" placeholder="enter email address here" />
        <button class="button_inner_shadow" name="button" v-on:click.prevent="submitEmail">Submit And Email</button>
      </form>
    </div>

  </div>
  
</template>

<script>
import axios from 'axios'
var QRCode = require('qrcode')
const { ipcRenderer } = require("electron");
// console.log('ipc -> ' + ipcRenderer + desktopCapturer)
const nodemailer = require('nodemailer');

export default {
  name: 'HelloWorld',
  data: () => ({
    cryptos: [],
    errors: [],
    interval: null,
    emailaddress: '',
  }),
  methods: {
    loadData: function () {
      axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=XTZ,BURST,ALGO&tsyms=USD')
      .then(response => {
        var tezos_price = document.getElementById('tezos_price')
        var burst_price = document.getElementById('burst_price')
        var algo_price = document.getElementById('algo_price')
        // var tezos_qrcode_img = document.getElementsByClassName('tezos_qrcode_img')
        this.cryptos = response.data
        //console.log(response)         // This will give you access to the full object
        tezos_price.innerHTML = response.data.XTZ.USD
        burst_price.innerHTML = response.data.BURST.USD
        algo_price.innerHTML = response.data.ALGO.USD
        QRCode.toDataURL(response.data.XTZ.USD.toString(), function (err, tezos_url) {
          document.getElementById('tezos_qrcode_frame').style.backgroundImage = "url('"+tezos_url+"')"; 
        })
        QRCode.toDataURL(response.data.BURST.USD.toString(), function (err, burst_url) {
          document.getElementById('burst_qrcode_frame').style.backgroundImage = "url('"+burst_url+"')";
        })
        QRCode.toDataURL(response.data.ALGO.USD.toString(), function (err, algo_url) {
          document.getElementById('algo_qrcode_frame').style.backgroundImage = "url('"+algo_url+"')";
        })

      })
      .catch(e => {
        this.errors.push(e)
      });
    },
    screenshot() {
      ipcRenderer.send('save-screen-shot')
    },
    submitEmail: function(event) {
      console.log(event)
      if ( typeof this.emailaddress !== 'undefined' && this.emailaddress && validateEmail(this.emailaddress) ) {
        this.sendMail(this.emailaddress)
      } else {
        alert('Please add a valid email address');
      }
    },
    pollData() {
      this.loadData();
      this.pollInterval = setInterval(() => {
        this.loadData();
       }, 7500)
    },
    sendMail(emailaddress) {
      // console.log('email address set, send email')
      nodeSendMail(nodemailer, emailaddress)
    },
  },
  created () {
    this.pollData()
    // this.sendMail()
  },
  beforeDestroy: function(){
    clearInterval(this.interval);
  },
}

function validateEmail(emailAddress) {
 // console.log('validate email ' + emailAddress)
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailAddress)) {
    return (true)
 }
    // alert("You have entered an invalid email address!")
    return (false)
}

function nodeSendMail(nodemailer, emailaddress) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 't1mel3ctr0n@gmail.com',
        pass: 't1st54alg0RAn3'
      }});

    const mailOptions = {
      from: 't1mel3ctr0n@gmail.com',
      to: emailaddress,
      subject: 'Send Attachment',
      text: 'Send Attachment Test',
      attachments: [{   // file on disk as an attachment
            filename: 'electron-screenshot.png',
            path: '/Users/sonicsir/Downloads/electron-screenshot.png' // stream this file
        }]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        ipcRenderer.send('screenshot-error')
      } else {
        console.log('Email sent: ' + info.response);
        ipcRenderer.send('email-sent')
      }
    });
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

h2{
  margin: 3px;
  color: #ffffff;
  size: 18px;
  text-shadow: .5px .5px #e9ecef;
}

h3 {
  margin: 3px;
  color:#ffffff;
  size: 14px;
}
ul {
  vertical-align: top;
  list-style-type: none;
  padding: 5px;
}
li {
  display: inline-block;
  margin: 5px;
}
li span {
  display:block;
  margin: 25px 45px 25px 45px;
  size: 12px;
  font-weight: bold;
}
div {
  margin: 3px;
}
a {
  color: #42b983;
}

#tezos_qrcode_frame {
    margin: auto;
    position: relative;
    width: 100px;
    height: 100px;
    background-position: center;
    background-size: cover; 
}

#tezos_logo {
    position: relative;
    width: 35px;
    top:35px;
    opacity: 0.72;
    text-align: middle;
    display: block;
    margin: auto; 
}

#burst_qrcode_frame {
    margin: auto;
    position: relative;
    width: 100px;
    height: 100px;
    background-position: center;
    background-size: cover; 
}

#burst_logo {
    position: relative;
    width: 35px;
    top:35px;
    opacity: 0.72;
    text-align: middle;
    display: block;
    margin: auto; 
}

#algo_qrcode_frame {
    margin: auto;
    position: relative;
    width: 100px;
    height: 100px;
    background-position: center;
    background-size: cover; 
}

#algo_logo {
    position: relative;
    width: 35px;
    top:35px;
    opacity: .72;
    text-align: middle;
    display: block;
    margin: auto; 
}

.header_border{
  margin: auto;
  text-align: center;
  vertical-align: middle;
  border-radius: 25px;
  border: 2px solid #73AD21;
  padding: 5px;
  width: 50%;
  height: auto; 
}
.crypto_price{
  font-weight: bold;
  color:#42b983;
  size: 12px;
}

#burst_display {
  display:inline-block; 
  width:45%; 
  padding:10px;
  
}

#algorand_display {
  display:inline-block; 
  width:45%; 
  padding:10px;
}

.screenshot_footer{
  margin: 10px 0 5px 0;
  padding: 5px 0 5px 0;
}

.button_inner_shadow {
  size: 22pt;
  color: #000;
  text-shadow: 0 1px 0 gray;
  text-align: center;
  font-weight: normal;
  display: block;
  padding: 5px;
  margin: 3px auto 5px;
  width: auto;
  background: #fff;
  border: 1px solid white;
  -moz-border-radius: 4px;
  -webkit-border-radius: 4px;
  -o-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
  -moz-box-shadow: 0 3px 3px #ccc;
  -webkit-box-shadow: 0 3px 3px #ccc;
  -o-box-shadow: 0 3px 3px #ccc;
  -ms-box-shadow: 0 3px 3px #ccc;
  box-shadow: 0 3px 3px #ccc;
}

.button_inner_shadow:hover {
margin: 5px auto 3px;
-moz-box-shadow: 0 0 1px #eee;
-webkit-box-shadow: 0 0 1px #eee;
-o-box-shadow: 0 0 1px #eee;
-ms-box-shadow: 0 0 1px #eee;
box-shadow: 0 0 1px #eee;
}

</style>

