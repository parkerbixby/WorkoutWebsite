DROP TABLE IF EXISTS user_plan;
DROP TABLE IF EXISTS user_review;
DROP TABLE IF EXISTS gym_review;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS gym;
DROP TABLE IF EXISTS membership_plan;
DROP TABLE IF EXISTS workout_num_id;
DROP TABLE IF EXISTS user_workout;
DROP TABLE IF EXISTS workout_body_part;
DROP TABLE IF EXISTS workout_info;
DROP TABLE IF EXISTS workout;
DROP TABLE IF EXISTS body_part;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  user_id INT AUTO_INCREMENT,
  user_name VARCHAR(255),
  password VARCHAR(255),
  PRIMARY KEY(user_id)
);

CREATE TABLE body_part (
  body_part_id INT AUTO_INCREMENT,
  body_part_name VARCHAR(255),
  PRIMARY KEY (body_part_id)
);

CREATE TABLE workout (
  workout_id INT AUTO_INCREMENT,
  workout_name VARCHAR(255),
  PRIMARY KEY (workout_id)
);

CREATE TABLE workout_info (
  workout_num INT AUTO_INCREMENT,
  reps INT,
  sets INT,
  weights INT,
  PRIMARY KEY (workout_num)
);

CREATE TABLE workout_body_part (
  workout_id INT,
  body_part_id INT,
  FOREIGN KEY (workout_id) REFERENCES workout(workout_id),
  FOREIGN KEY (body_part_id) REFERENCES body_part(body_part_id),
  PRIMARY KEY (workout_id,body_part_id)
);

CREATE TABLE user_workout (
  user_id INT,
  workout_id INT,
  workout_num INT,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (workout_id) REFERENCES workout(workout_id),
  FOREIGN KEY (workout_num) REFERENCES workout_info(workout_num),
  PRIMARY KEY (user_id,workout_id,workout_num)
);

CREATE TABLE workout_num_id (
  workout_id INT,
  workout_num INT,
  FOREIGN KEY (workout_id) REFERENCES workout(workout_id),
  FOREIGN KEY (workout_num) REFERENCES workout_info(workout_num),
  PRIMARY KEY (workout_id, workout_num)
);


CREATE TABLE membership_plan (
  plan_id INT AUTO_INCREMENT,
  plan_name VARCHAR(255),
  cost INT,
  PRIMARY KEY(plan_id)
);

CREATE TABLE gym (
  gym_id INT AUTO_INCREMENT,
  gym_name VARCHAR(255),
  location VARCHAR(255),
  PRIMARY KEY(gym_id)
);

CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT,
  rating INT CHECK (Rating BETWEEN 1 AND 5),
  description VARCHAR(255),
  PRIMARY KEY (review_id)
);


CREATE TABLE gym_review (
  gym_id INT,
  review_id INT,
  FOREIGN KEY (gym_id) REFERENCES gym(gym_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id),
  PRIMARY KEY(gym_id, review_id)
);

CREATE TABLE user_review (
  user_id INT,
  review_id INT,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id),
  PRIMARY KEY (user_id, review_id)
);

CREATE TABLE user_plan (
  user_id INT,
  plan_id INT,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (plan_id) REFERENCES membership_plan(plan_id),
  PRIMARY KEY(user_id,plan_id)
);



INSERT INTO body_part (body_part_name) VALUES ('Back'), ('Bicep'), ('Quadricep'), ('Tricep'), ('Chest'), ('Calves'), ('Forearms'), ('Shoulders'), ('Abductors'), ('Hamstrings');
-- -- -- -- Back Workouts
INSERT INTO workout (workout_name) VALUES ('Deadlift'), ('Lat Pulldown'), ('Barbell Bent-Over Row'), ('Single-Arm Dumbell Row'), ('Face Pull');
-- -- -- -- Bicep Workouts
INSERT INTO workout (workout_name) VALUES ('Barbell Bicep Curl'), ('Incline Dumbell Curl'), ('Dumbell Hammer Curl'), ('Preacher Curl'), ('Cable Rope Hammer Curl');
-- -- -- -- Quad Workouts
INSERT INTO workout (workout_name) VALUES ('Barbell Back Squat'), ('Leg Press'), ('Walking Lunges'), ('Dumbell Step-Ups'), ('Hack Squat Machine');
-- -- -- -- Tricep workouts
INSERT INTO workout (workout_name) VALUES ('Tricep Dips'), ('Tricip Pushdown'), ('Close-Grip Bench Press'), ('Overhead Dumbell Tricep Extension'), ('Skull Crushers');
-- -- -- -- Chest Workout
INSERT INTO workout (workout_name) VALUES ('Barbell Bench Press'), ('Dumbell Flyes'), ('Incline Dumbell Press'), ('Push-Ups'), ('Decline Barbell Bench Press');
-- -- -- -- Calve Workout
INSERT INTO workout (workout_name) VALUES ('Standing Calf Raises'), ('Seated Calf Raises'), ('Calf Press on the Leg Press Machine'), ('Donkey Calf Raises'), ('Calf Raises on the Smith Machine');
-- -- -- -- Forearm Workout
INSERT INTO workout (workout_name) VALUES ('Wrist Curls'),('Reverse Wrist Curls'),('Farmers Walk'),('Plate Pinch');
-- -- -- -- Shoulder Workout
INSERT INTO workout (workout_name) VALUES ('Overhead Dumbbell Press'),('Lateral Raises'),('Front Dumbbell Raises'),('Reverse Pec Deck Machine'),('Shrugs');
-- -- -- -- Abductor Workout
INSERT INTO workout (workout_name) VALUES ('Crunches'),('Leg Raises'),('Russian Twists'),('Plank'),('Mountain Climbers');
-- -- -- -- Hamstrings Workout
INSERT INTO workout (workout_name) VALUES ('Romanian Deadlift'), ('Hamstring Curls'), ('Walking Lunges'), ('Good Mornings'), ('Hamstring Ball Curl');

-- -- -- -- -- Workout Bodyparts
-- -- -- -- Connecting 'Back' exercises with 'Back Workouts'
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (1, 1), (2, 1), (3, 1), (4, 1), (5, 1);
-- -- -- -- Back Workout Connection to Exercise
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (6, 2), (7, 2), (8, 2), (9, 2), (10, 2);
-- -- -- -- Quad Workout Connection to Exercise
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (11, 3), (12, 3), (13, 3), (14, 3), (15, 3);
-- -- -- -- Tricep Workout Connection to Exercise
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (16, 4), (17, 4), (18, 4), (19, 4), (20, 4);
-- -- -- -- Chest
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (21, 5), (22, 5), (23, 5), (24, 5), (25, 5);
-- -- -- -- Calves
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (26, 6), (27, 6), (28, 6), (29, 6), (30, 6);
-- -- -- -- Forearms
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (31, 7), (32, 7), (33, 7), (34, 7);
-- -- -- -- Shoulders
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (35, 8), (36, 8), (37, 8), (38, 8), (39,8);
-- -- -- -- Abs
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (40, 9), (41, 9), (42, 9), (43, 9), (44,9);
-- -- -- -- Hamstrings
INSERT INTO workout_body_part (workout_id, body_part_id) VALUES (45, 10), (46, 10), (47, 10), (48, 10), (49,10);

-- -- -- -- -- Membership Plans
INSERT INTO membership_plan (plan_name, cost) VALUES ('Basic', 30),('Standard', 50), ('Premium', 80), ('Family', 120), ('Student Plan', 25);

-- -- -- -- -- Gym Inserts
INSERT INTO gym (gym_name, location) VALUES ('Fitness First', '123 Main Street, City A'), ('Powerhouse Gym', '456 Oak Avenue, City B'), ('Elite Fitness Center', '789 Pine Lane, City C'),('BodyTech Fitness', '101 Maple Road, City D'),('Total Wellness Gym', '234 Cedar Boulevard, City E');


-- -- -- -- -- Reviews for Fitness First
 INSERT INTO reviews (rating, description) VALUES (4, 'Great equipment and friendly staff.'), (5, 'Clean and spacious gym with excellent classes.'), (3, 'Decent facilities, but can get crowded during peak hours.'),
(4, 'Knowledgeable trainers and good atmosphere.'), (5, 'Love the variety of equipment and the 24/7 access.');

-- -- -- -- -- Reviews for Powerhouse Gym
INSERT INTO reviews (rating, description) VALUES (5, 'Fantastic gym, especially for serious lifters.'), (4, 'Well-maintained equipment and motivating environment.'), (3, 'Limited parking space, but great workouts.'),
(5, 'Excellent personal training programs available.'), (4, 'Friendly staff and a good sense of community.');

-- -- -- -- Reviews for Elite Fitness Center
INSERT INTO reviews (rating, description) VALUES (4, 'High-end equipment and upscale amenities.'), (5, 'Beautiful facility with top-notch trainers.'), (3, 'Pricing is a bit steep, but the quality is worth it.'),
(4, 'Clean and well-designed gym space.'), (5, 'Love the spa services and relaxation areas.');

-- -- -- -- -- Reviews for BodyTech Fitness
INSERT INTO reviews (rating, description) VALUES (3, 'Good for basic workouts, but lacks some advanced equipment.'), (4, 'Friendly and helpful staff, decent variety of classes.'),(3, 'Equipment maintenance could be improved.'),
(5, 'Affordable membership with quality facilities.'), (4, 'Clean and well-organized gym space.');

-- -- -- -- -- Reviews for Total Wellness Gym
INSERT INTO reviews (rating, description) VALUES (5, 'Exceptional wellness programs and personalized fitness plans.'), (4, 'Spacious and modern gym with a focus on holistic health.'), (5, 'Friendly and knowledgeable staff; excellent yoga classes.'),
(4, 'Great emphasis on overall well-being and nutrition.'), (3, 'Limited parking options, but the classes are fantastic.');


