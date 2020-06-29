const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// const adapter = new FileSync('../../db/db.json')
// const db = low(adapter);

// // Set some defaults
// db.defaults({ posts: [], user: {} })
//   .write()

// // Add a post
// db.get('posts')
//   .push({ id: 1, title: 'lowdb is awesome'})
//   .write()

// // Set a user using Lodash shorthand syntax
// db.set('user.name', 'typicode')
//   .write()

class DB {
  init(filePath) {
    if (!fs.existsSync(path.resolve(__dirname, "../../db"))) {
      fs.mkdirSync(path.resolve(__dirname, "../../db"));
    }
    if (!filePath) {
      filePath = path.resolve(__dirname, "../../db/robot.json")
    }

    let db = null;
    const adapter = new FileSync(filePath);
    if (!fs.existsSync(filePath)) {
      db = low(adapter);

      // Set some defaults
      db.defaults({ posts: [], user: {} })
        .write()

      // Add a post
      db.get('posts')
        .push({ id: 1, title: 'lowdb is awesome'})
        .write()

      // Set a user using Lodash shorthand syntax
      db.set('user.name', 'type code')
        .write()
    } else {
      db = low(adapter);
    }

    this.db = db;
  }
}
