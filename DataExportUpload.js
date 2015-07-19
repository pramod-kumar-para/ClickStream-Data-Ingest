var mixpanel_config=require('./mixpanel-config.js'),
	s3_config=require('./s3-config.js'),
 	fs=require('fs'),
 	request=require('request'),
 	crypt=require('crypto'),
 	s3=require('s3');
var keys=['api_key','expire','event','where','unit','to_date','from_date','type','format'];
var api_key=mixpanel_config.api_access_key;
var api_secret=mixpanel_config.api_access_secret;
var api_endpoint='http://mixpanel.com/api/2.0/events?';
var unit='day';
var where='';
var type='general';
var from_date='2015-06-20';
var to_date='2015-06-27';
var event=JSON.stringify(['View page','Video play']);
var expire=Date.now()+60*10*1000;
var format='csv';
function getApiParameters(keys) {
  return [
        'api_key=' + api_key,
        'expire=' + expire,
        'event=' + event,
        'where=' + where,
        'type=' + type,
        'unit=' + unit,
        'format='+format,
        'from_date=' + from_date,
        'to_date=' + to_date
    ];
}
var parameters=getApiParameters(keys);
var sortparam=parameters.sort().join('')+api_secret;
var signature=crypt.createHash('md5').update(sortparam).digest('hex');
var urlParams=getApiParameters(keys).join('&')+"&sig="+signature;
urlParams = urlParams.replace(/\%/g, '%25');   
urlParams = urlParams.replace(/\s/g, '%20');
urlParams = urlParams.replace(/\[/g, '%5B');
urlParams = urlParams.replace(/\]/g, '%5D');
urlParams = urlParams.replace(/\"/g, '%22');
urlParams = urlParams.replace(/\(/g, '%28');
urlParams = urlParams.replace(/\)/g, '%29');
urlParams = urlParams.replace(/\>/g, '%3E');
urlParams = urlParams.replace(/\</g, '%3C');
urlParams = urlParams.replace(/\-/g, '%2D');   
urlParams = urlParams.replace(/\+/g, '%2B');   
urlParams = urlParams.replace(/\//g, '%2F');
var url=api_endpoint+urlParams;
console.log(url);
request(url, function(err, res, body) {
    if (!err && res.statusCode == 200) {
	     console.log(body);
	      fs.writeFile('./mixpanel.csv',body,function(err) {
          if(err) throw err;
          console.log('saved');
      });
	      var client = s3.createClient({
  maxAsyncS3: 20,    
  s3RetryCount: 3,   
  s3RetryDelay: 1000, 
  multipartUploadThreshold: 20971520, 
  multipartUploadSize: 15728640, 
  s3Options: {
    accessKeyId: s3_config.access_key_id,
    secretAccessKey: s3_config.access_key_token,
    },
});
  
 var params = {
  localFile: "./mixpanel.csv",

  s3Params: {
    Bucket: "your-bucket-name",
    Key: "/mixpanel",
    },
};
var uploader = client.uploadFile(params);
uploader.on('error', function(err) {
  console.error("unable to upload:", err.stack);
});
uploader.on('progress', function() {
  console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function() {
  console.log("done uploading");
});



	   }
  });  


