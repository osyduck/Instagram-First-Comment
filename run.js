const Instagram = require('instagram-web-api')
const FileCookieStore = require('tough-cookie-filestore2')
const inquirer = require('inquirer');
const moment = require('moment');
const fs = require('fs');
const delay = require('delay');

/////CONFIG///////
const target = "osyduck";
const jeda = "3"
/////CONFIG///////



; (async () => {
  const { username, password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password',
      mask: true
    }
  ])

  const cookieStore = new FileCookieStore('./kue.json')
  const client = new Instagram({ username, password, cookieStore })
  const login = await client.login()

  if (login.authenticated == true) {
    console.log("Logged in Successfully ");
  } else {
    console.log("Failed to Login");
  }

  while(true){
  const profileTarget = await client.getUserByUsername({ username: target })
  const id = profileTarget.edge_owner_to_timeline_media.edges[0].node.id;
  const url = "https://www.instagram.com/p/" + profileTarget.edge_owner_to_timeline_media.edges[0].node.shortcode;

  var lastId = fs.readFileSync("last.txt", 'utf-8');
  var commentList = fs.readFileSync("comment.txt", 'utf-8');
  var cmt = commentList.split(",")
  var cmnt = cmt[Math.floor(Math.random() * cmt.length)]

  if(id != lastId){
    
    const addcomment = await client.addComment({ mediaId: `${id}`, text: `${cmnt}` })
    if(addcomment.status == "ok"){
      console.log(`[ ${moment().format('HH:mm:ss')} ] Commented ${cmnt} on ${url}`)
    }else{
      console.log(`[ ${moment().format('HH:mm:ss')} ] Failed to Comment ${cmnt} on ${url}`)
    }
    fs.writeFile('last.txt', `${id}`, function (err) {
      if (err) return console.log(err);
      console.log('Last Post Saved');
    });
  }else{
    console.log(`[ ${moment().format('HH:mm:ss')} ] No New Post Found`)
  }
  await delay(`${jeda}000`)
}
})()