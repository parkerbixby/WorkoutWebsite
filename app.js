const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'cps-database.gonzaga.edu',
  user: 'pbixby',
  password: 'asdfghjkl;\'',
  database: 'pbixby_DB',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Set up session
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
}));

// Set up body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index', { message: '' });
});

//Login Route
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user_id = req.body.user_id;
  //Check if username and password have values
  if (username && password) {
    db.query('SELECT * FROM user WHERE user_name = ?', [username], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        //Comparing the hashed password to the hashed password in the database
        const hashedPassword = results[0].password;
        bcrypt.compare(password, hashedPassword, (err, passwordMatch) => {
          if (err) throw err;

          if (passwordMatch) {
            req.session.loggedin = true;
            req.session.username = username;
            req.session.user_id = user_id;
            res.redirect('/dashboard');
          } else {
            res.render('index', { message: 'Incorrect username or password' });
          }
        });
      } else {
        res.render('index', { message: 'Incorrect username or password' });
      }
    });
  } else {
    res.render('index', { message: 'Please enter both username and password' });
  }
});

app.get('/dashboard', (req, res) => {
  if (req.session.loggedin) {
    res.render('dashboard', { username: req.session.username });
  } else {
    res.redirect('/');
  }
});

app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    // Check if the username already exists in the database
    db.query('SELECT * FROM user WHERE user_name = ?', [username], (err, results) => {
      if (err) throw err;

      // If the username is not already taken, proceed with registration
      if (results.length === 0) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) throw err;

          // Insert the new user into the database
          db.query('INSERT INTO user (user_name, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
            if (err) throw err;

            // Retrieve the newly created user's ID
            db.query('SELECT user_id FROM user WHERE user_name = ?', [username], (err, results) => {
              if (err) throw err;

              const user_id = results[0].user_id;

              // Store user ID in the session
              req.session.loggedin = true;
              req.session.username = username;
              req.session.user_id = user_id;

              res.redirect('/dashboard');
            });
          });
        });
      } else {
        // Username is already taken, display an error message
        res.render('signup', { message: 'Username is already taken. Please choose a different username.' });
      }
    });
  } else {
    res.render('signup', { message: 'Please enter both username and password' });
  }
});

app.get('/gyms', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  // Fetch gyms from the database
  db.query('SELECT * FROM gym', (err, results) => {
    if (err) throw err;
    res.render('gyms', { loggedin: req.session.loggedin, username: req.session.username, gyms: results });
  });
});
app.post('/gym-reviews', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  // Extract the selected gym_id from the form submission
  const selectedGymId = req.body.gym;

  // Redirect to the dynamic gym reviews route with data as URL parameters
  res.redirect(`/gym-reviews/${selectedGymId}?loggedin=${req.session.loggedin}&user_id=${req.session.user_id}&username=${req.session.username}`);
});


app.get('/gym-reviews/:gymId', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }

  const gymId = req.params.gymId;
  const query = `SELECT r.rating, r.description, r.review_id, g.gym_id, g.gym_name, ur.user_id FROM gym g JOIN gym_review gr USING (gym_id) JOIN reviews r ON gr.review_id = r.review_id JOIN user_review ur ON ur.review_id = r.review_id WHERE g.gym_id = ?`;
  
  db.query(query, [gymId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    db.query('SELECT user_id FROM user WHERE user_name = ?', [req.session.username], (err,results2) =>{
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.render('gym-reviews', {user_id : results2[0].user_id, loggedin: req.session.loggedin, username: req.session.username, reviews: results, review_user_id: results[0]});
    })
  });
  
});



app.get('/remove/:review_id', (req,res) => {
  var selectedReview = req.params.review_id;
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  db.query('DELETE FROM user_review WHERE review_id = ?', [selectedReview], (err,results3) =>{
    db.query('DELETE FROM gym_review WHERE review_id = ?', [selectedReview], (err,results2) => {
      db.query('DELETE FROM reviews WHERE review_id = ?',[selectedReview], (err,results) =>{
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.render('dashboard', {user_id : req.session.user_id, loggedin: req.session.loggedin, username: req.session.user_name});
      })
    })
  })
});

app.get('/edit-reviews/:review_id', (req,res) => {
  var selectedReview = req.params.review_id;
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  db.query('SELECT * FROM reviews JOIN user_review USING (review_id) WHERE review_id = ?',[selectedReview], (err,results) =>{
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('edit-reviews', {user_id : req.session.user_id, loggedin: req.session.loggedin, username: req.session.user_name, reviews: results[0]});
  })
});

app.post('/edit-reviews/:review_id', (req,res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  var selectedReview = req.body.review_id;
  var radio = req.body.radio;
  var comments = req.body.comments;
  db.query('UPDATE reviews SET rating = ?, description = ? WHERE review_id = ?', [radio,comments, selectedReview], (err,res) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
  })
  res.render('dashboard', {user_id : req.session.user_id, loggedin: req.session.loggedin, username: req.session.user_name});
});

app.post('/remove-reviews/:review_id', (req,res) => {
  var selectedReview = req.body.review_id;

})


app.get('/reviews', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  db.query('SELECT gym_id, gym_name FROM gym', (err, results) => {
    if (err) throw err;
    // Render the gyms.ejs file and pass the gym data
    res.render('reviews', { loggedin: req.session.loggedin, username: req.session.username, user_id:req.session.user_id, gym: results });
  });
});

app.post('/reviews', (req,res) =>{
   if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  var gym_name = req.body['gymID'];
  var radio = req.body.radio;
  var comment = req.body.comments;
  const q1 = 'INSERT INTO reviews (rating, description) VALUES (?,?)';
  const q3 = 'INSERT INTO user_review (user_id, review_id) VALUES (?,?)';
  const q2 = 'SELECT review_id FROM reviews ORDER BY review_id DESC LIMIT 1';
  const user_name = req.session.username;
  const q4 = 'SELECT user_id FROM user WHERE user_name = ?';
  const q5 = 'INSERT INTO gym_review (gym_id,review_id) VALUES (?,?)';
  db.query(q4, [user_name], (err,results0) =>{
    db.query(q1, [radio,comment], (err,results1) => {
      if (err) throw err;
    })

    db.query(q2, (err,results2) => {
      if (err) throw err;
        db.query(q3, [results0[0].user_id,results2[0].review_id],(err,results3) =>{
          if (err) throw err;
        })
          db.query(q5, [gym_name, results2[0].review_id], (err,results5) => {
            if (err) throw err;
          })
      })
    })
  res.redirect('/dashboard');
});

app.get('/body-part', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  db.query('SELECT DISTINCT body_part_name FROM body_part', (err, results) => {
    if (err) throw err;

    const bodyPartOptions = results.map(result => result.body_part_name);
    res.render('body-part', { username: req.session.username, bodyPartOptions });
  });
});

// Modify the route to use app.post
app.post('/select-workout', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  const selectedBodyPart = req.body.selectedBodyPart;
  const q = 'SELECT w.workout_id, w.workout_name FROM workout w JOIN workout_body_part w_bp ON w.workout_id = w_bp.workout_id JOIN body_part bp ON w_bp.body_part_id = bp.body_part_id WHERE bp.body_part_name = ?' ; 

  db.query(q, [selectedBodyPart], (err, results) => {
    if (err) {
      console.error('Error fetching workouts:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.render('select-workout', { bodyPart: selectedBodyPart, workouts: results });
  });

});


app.post('/post-workout', (req,res) =>{
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  const user_name = req.session.username;
  //Query to select the user's id 
  const q1 = 'SELECT user_id FROM user WHERE user_name = ?'
  db.query(q1, [user_name], (err,results1) =>{
    if(err){
      console.error('Error finding user_id', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const user_id = results1[0].user_id;
    const workout = req.body.workout;
    const reps = req.body.reps;
    const sets = req.body.sets;
    const weight = req.body.weight;
    const q2 = 'INSERT INTO workout_info (reps, sets, weights) VALUES (?,?,?)';
    const q5 = 'SELECT workout_num FROM workout_info ORDER BY workout_num DESC LIMIT 1';
    const q3 = 'INSERT INTO user_workout (user_id, workout_id,workout_num) VALUES (?,?,?)';
  //  Creating new instance of workout_info, make a workout_num
    db.query(q2, [reps,sets,weight],(err,results2) =>{
      if(err){
        console.error('Error Inserting workout_info', err);
        return res.status(500).json({error: 'Error'});
      }
    })
    // Find most recently made workout_num
    db.query(q5, [], (err,results4) => {
      if(err){
        console.error('Error Selecting workout_num', err);
        return res.status(500).json({error: 'Error'});
      }
      //Insert into user_workout to connect the tables
      db.query(q3, [user_id,workout,results4[0].workout_num], (err,results3) => {
        if(err){
          console.error('Error Inserting user_workout', err);
          return res.status(500).json({error: 'Error'});
        }
      })
    })
  })
  res.render('dashboard');
});

// Getting the list of all workouts from all users, with weights, reps and sets.
app.get('/workout-history', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  const user_name = req.session.username;

  const getUserIdQuery = 'SELECT user_id FROM user WHERE user_name = ?';

  db.query(getUserIdQuery, [user_name], (err, results) => {
    if (err) {
      console.error('Error finding user_id', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const getWorkoutHistoryQuery = `SELECT u.user_id,u.user_name, w.workout_name, w_info.reps, w_info.sets, w_info.weights FROM user u JOIN user_workout uw USING (user_id) JOIN workout w USING (workout_id) JOIN workout_info w_info USING (workout_num)`;

    db.query(getWorkoutHistoryQuery, [], (error, workoutHistory) => {
      if (error) {
        console.error('Error fetching workout history:', error);
        return res.status(500).send('Internal Server Error');
      }
      res.render('workout-history', { loggedin: req.session.loggedin, username: req.session.username, workoutHistory });
    })
  })
});

app.post('/workout-history', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  const filterby = req.body.filterby;
  const search = req.body.search;
  const user_name = req.session.username;

  // Query to get the user_id based on the username
  const getUserIdQuery = 'SELECT user_id FROM user WHERE user_name = ?';

  db.query(getUserIdQuery, [user_name], (err, results) => {
    if (err) {
      console.error('Error finding user_id', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Query to fetch workout history details and filter by the workout name
      if(filterby == 'workout'){
        var getWorkoutHistoryQuery = `SELECT u.user_id,u.user_name, w.workout_name, w_info.reps, w_info.sets, w_info.weights FROM user u JOIN user_workout uw USING (user_id) JOIN workout w USING (workout_id) JOIN workout_info w_info USING (workout_num) WHERE INSTR(w.workout_name,?)`;
        db.query(getWorkoutHistoryQuery, [search], (error, workoutHistory) => {
          if (error) {
            console.error('Error fetching workout history:', error);
            return res.status(500).send('Internal Server Error');
          }
          res.render('workout-history', { loggedin: req.session.loggedin, username: req.session.username, workoutHistory });
        })
      }
      //Query to fetch workouts with the users name
      else if(filterby == 'username'){
        var getWorkoutHistoryQuery = `SELECT u.user_id,u.user_name, w.workout_name, w_info.reps, w_info.sets, w_info.weights FROM user u JOIN user_workout uw USING (user_id) JOIN workout w USING (workout_id) JOIN workout_info w_info USING (workout_num) WHERE INSTR(u.user_name,?)`;
        db.query(getWorkoutHistoryQuery, [search], (error, workoutHistory) => {
          if (error) {
            console.error('Error fetching workout history:', error);
            return res.status(500).send('Internal Server Error');
          }
          res.render('workout-history', { loggedin: req.session.loggedin, username: req.session.username, workoutHistory });
        })
      }
  })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
