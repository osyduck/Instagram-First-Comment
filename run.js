const Instagram = require('instagram-web-api')
const FileCookieStore = require('tough-cookie-filestore2')
const inquirer = require('inquirer');
const moment = require('moment');
const fs = require('fs');
const delay = require('delay');

/////CONFIG///////
const jeda = "3"
/////CONFIG///////


async function simpan(target, last) {
  var lastId = fs.readFileSync("target.json", 'utf-8');

  var tar = target
  var a = JSON.parse(lastId)
  a[tar] = last
  var b = JSON.stringify(a)
  fs.writeFile('target.json', `${b}`, function (err) {
    if (err) return console.log(err);
    //console.log('Last Post Saved');
  });
}
(async () => {
  try {
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

    if (login.authenticated != true) throw new Error('Login Failed')
    while (true) {

      var target = fs.readFileSync("target.json", 'utf-8');
      var json = JSON.parse(target);

      for (const [key, value] of Object.entries(json)) {
        console.log(`Checking ${key}`)
        const profileTarget = await client.getUserByUsername({ username: key })
        const id = profileTarget.edge_owner_to_timeline_media.edges[0].node.id;

        const url = "https://www.instagram.com/p/" + profileTarget.edge_owner_to_timeline_media.edges[0].node.shortcode;

        var lastId = fs.readFileSync("target.json", 'utf-8');
        var json = JSON.parse(lastId);
        var lastIds = json[key]
        var commentList = fs.readFileSync("comment.txt", 'utf-8');
        var cmt = commentList.split(",")
        var cmnt = cmt[Math.floor(Math.random() * cmt.length)]


        if (id != lastIds) {

          const addcomment = await client.addComment({ mediaId: `${id}`, text: `${cmnt}` })
          if (addcomment.status == "ok") {
            console.log(`[ ${moment().format('HH:mm:ss')} ] Commented ${cmnt} on ${url}`)
          } else {
            console.log(`[ ${moment().format('HH:mm:ss')} ] Failed to Comment ${cmnt} on ${url}`)
          }
          await simpan(key, `${id}`)
        } else {
          console.log(`[ ${moment().format('HH:mm:ss')} ] No New Post Found`)
        }
        await delay(`${jeda}000`)
      }
      await delay(`${jeda}000`)
    }
  } catch (e) {
    console.log(e)
  }
})()