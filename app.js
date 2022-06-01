const express = require("express")
const path = require("path");
const nodemailer = require("nodemailer");


const app = express();
const port = process.env.PORT || 3000;

// Setting path for public directory
const static_path = path.join(__dirname, "public");
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing

// Handling request
app.post("/request", (req, res) => {

	fileName = req.body.filename;
	theContent = req.body.theContent;

	let return_value = main(fileName,theContent).catch(console.error);

	res.json([{
		url: return_value
	}])

})

// Server Setup
app.listen(port, () => {
console.log(`server is running at ${port}`);
});

async function main(fileName,theContent){

	let testAccount = await nodemailer.createTestAccount();
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: testAccount.user, // generated ethereal user
			pass: testAccount.pass, // generated ethereal password
	  
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to: "bar@example.com, baz@example.com", // list of receivers
		subject: "Hello ✔", // Subject line
		text: "Hello world?", // plain text body
		html: "<b>Hello world?</b>", // html body
		attachments: [
		{   // encoded string as an attachment
				filename: fileName,
				path: theContent
				//content: theContent,
				//encoding: 'base64'
			}
		]
	});

	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

	return nodemailer.getTestMessageUrl(info);
	

}
