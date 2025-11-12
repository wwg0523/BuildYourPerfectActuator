-- Seed data for ActuatorMinigame
-- This file populates initial quiz questions into the database
-- Execute after schema.sql

-- Insert 15 quiz questions
INSERT INTO quiz_questions_cache (id, type, category, difficulty, question, application_name, options, correct_answer, explanation, points)
VALUES
-- Q1: Multiple-choice Easy
('q1', 'multiple-choice', 'daily-life', 'easy', 
 'Which of the following is an automotive component that uses an actuator?',
 'Side Mirror Adjustment',
 '["A) Side mirror angle adjustment", "B) Radio volume control", "C) Dashboard illumination", "D) Seatbelt buckle"]'::jsonb,
 'A',
 '{
   "correct": "The side mirror uses an electric actuator that allows the driver to adjust the angle from inside the vehicle. It consists of a small electric motor and gearbox that control the mirror''s horizontal and vertical movement.",
   "improvements": ["Improved precision → More accurate angle adjustment", "Enhanced response speed → Faster adjustment time", "Increased torque → Smooth operation even for large mirrors"],
   "realWorldExamples": ["Premium vehicles: Memory function for automatic adjustment per driver", "Electric vehicles: Low-power actuators for better battery efficiency"]
 }'::jsonb,
 15),

-- Q2: Multiple-choice Easy
('q2', 'multiple-choice', 'daily-life', 'easy',
 'Which core component does a robot vacuum use to change direction?',
 'Robot Vacuum Wheel Drive',
 '["A) Camera", "B) Wheel drive motor actuator", "C) Dustbin", "D) Battery"]'::jsonb,
 'B',
 '{
   "correct": "A robot vacuum has independent DC motor actuators attached to each wheel. It controls the speed of left and right wheels differently to rotate, and adjusts forward/backward movement.",
   "improvements": ["Increased torque → Easy movement over high-resistance floors like carpets", "Precise control → Accurate navigation in narrow spaces", "Low-noise design → Quiet cleaning operation"],
   "realWorldExamples": ["Budget models: Simple 2-wheel drive for basic navigation", "Premium models: 4-wheel independent drive for complex path planning"]
 }'::jsonb,
 15),

-- Q3: Multiple-choice Medium
('q3', 'multiple-choice', 'daily-life', 'medium',
 'What is used to adjust the height and angle of a hospital bed?',
 'Hospital Bed Height Control',
 '["A) Manual crank", "B) Hydraulic cylinder", "C) Electric linear actuator", "D) Spring"]'::jsonb,
 'C',
 '{
   "correct": "Modern hospital beds use electric linear actuators to precisely adjust bed height, backrest angle, and leg rest angle. This simultaneously improves patient comfort and caregiver work efficiency.",
   "improvements": ["Increased load capacity → Safely supports heavier patients", "Reduced noise → Minimizes patient sleep disturbance", "Speed control → Smooth movement for patient safety", "Enhanced durability → Long-lasting even with frequent use"],
   "realWorldExamples": ["Standard hospital beds: 3-5 linear actuators for multi-position adjustment", "ICU beds: Advanced sensors with safety override features"]
 }'::jsonb,
 15),

-- Q4: Multiple-choice Easy
('q4', 'multiple-choice', 'daily-life', 'easy',
 'Which component enables automatic height adjustment in office desks?',
 'Electric Standing Desk',
 '["A) Hydraulic cylinder", "B) Spring", "C) Electric linear actuator", "D) Chain hoist"]'::jsonb,
 'C',
 '{
   "correct": "Electric standing desks use linear actuators to smoothly adjust desk height. This allows workers to alternate between sitting and standing positions throughout the day.",
   "improvements": ["Smooth motion → Comfortable height adjustment", "Load capacity → Supports heavy equipment and materials", "Quiet operation → Non-disruptive in office environment"],
   "realWorldExamples": ["Basic models: Single motor actuator for synchronized rise", "Premium models: Dual motor for independent control and level correction"]
 }'::jsonb,
 15),

-- Q5: Multiple-choice Medium
('q5', 'multiple-choice', 'daily-life', 'medium',
 'What is used to raise and lower a projector screen automatically in a home theater?',
 'Motorized Projector Screen',
 '["A) Tubular motor actuator", "B) Manual pulley", "C) Pneumatic cylinder", "D) Electromagnet"]'::jsonb,
 'A',
 '{
   "correct": "Home theater projector screens use tubular motor actuators (tube motors) that are integrated into the screen roller. These silent, compact motors smoothly raise and lower the screen with electronic control.",
   "improvements": ["Silent operation → No noise during movie viewing", "Smooth speed → Gradual screen deployment", "Integrated design → Compact mounting inside screen tube"],
   "realWorldExamples": ["Basic theater: Simple on/off motor control", "Advanced systems: Variable speed with position memory"]
 }'::jsonb,
 20),

-- Q6: Multiple-choice Medium
('q6', 'multiple-choice', 'daily-life', 'medium',
 'Which sensor-actuator system is used in a washing machine for load-dependent operation?',
 'Intelligent Washing Machine',
 '["A) Temperature sensor only", "B) Motor actuator for drum rotation", "C) Drain pump only", "D) Detergent dispenser"]'::jsonb,
 'B',
 '{
   "correct": "The motor actuator in a washing machine drives the drum rotation. It adapts to the load weight detected by sensors to optimize water usage, spin speed, and cycle time.",
   "improvements": ["Energy efficiency → Reduced power consumption for smaller loads", "Water savings → Proportional water usage based on load", "Fabric protection → Variable speed prevents damage"],
   "realWorldExamples": ["Budget models: Fixed speed operation", "Smart models: AI-powered load detection and cycle optimization"]
 }'::jsonb,
 20),

-- Q7: Multiple-choice Medium
('q7', 'multiple-choice', 'daily-life', 'medium',
 'What powers the movement in an electric wheelchair?',
 'Electric Wheelchair Mobility',
 '["A) Battery power alone", "B) Wheel drive DC motor actuators", "C) Hydraulic pump", "D) Generator"]'::jsonb,
 'B',
 '{
   "correct": "Electric wheelchairs use independently controlled DC motor actuators on each wheel. These enable smooth acceleration, precise turning, and smooth deceleration with proportional joystick control.",
   "improvements": ["Extended range → Improved battery efficiency", "Smooth control → Better maneuverability in tight spaces", "Safety features → Automatic speed reduction on slopes"],
   "realWorldExamples": ["Manual control: Joystick-based movement", "Advanced models: Head control, voice commands, autonomous navigation"]
 }'::jsonb,
 20),

-- Q8: Multiple-choice Medium
('q8', 'multiple-choice', 'daily-life', 'medium',
 'Which products use motor actuators in a smart home system? (Select all that apply)',
 'Smart Home Integration',
 '["A) Automatic curtain system, Smart door lock", "B) Automatic curtain system, Smart door lock, Robot vacuum brush motor", "C) Smart door lock, Temperature sensor, Robot vacuum brush motor", "D) Automatic curtain system, Temperature sensor, Robot vacuum brush motor"]'::jsonb,
 'B',
 '{
   "correct": "Automatic curtain systems, smart door locks, and robot vacuum motors are all actuators. Temperature sensors are input devices (not actuators). Modern smart homes integrate: Sensors (input) → Controller (processing) → Actuators (output).",
   "improvements": ["Enhanced integration → Unified smartphone control", "Improved automation → Routine tasks execute automatically", "Energy efficiency → Coordinated device operation reduces power consumption"],
   "realWorldExamples": ["Samsung SmartThings: Integrated control of curtains, locks, and vacuum", "Philips Hue: LED drivers (actuators) for brightness and color adjustment", "Nest Thermostat: Learns patterns and controls HVAC actuators automatically"]
 }'::jsonb,
 20),

-- Q9: Multiple-choice Hard
('q9', 'multiple-choice', 'daily-life', 'hard',
 'Which motor actuator systems are essential in electric vehicles?',
 'EV Powertrain System',
 '["A) Inverter, Power steering, Regenerative braking motor", "B) Power steering, Regenerative braking motor, Active suspension", "C) Inverter, Regenerative braking motor, Active suspension", "D) Inverter, Power steering, Active suspension"]'::jsonb,
 'B',
 '{
   "correct": "Electric power steering (EPS) and regenerative braking motor are actuators. Active suspension uses electromagnetic or hydraulic actuators. The inverter is a power converter (not an actuator). It controls the motor but doesn''t produce mechanical motion itself.",
   "improvements": ["EPS precision → Variable assist based on speed (light at low speed, heavy at high speed)", "Regenerative efficiency → Recovers up to 30% of kinetic energy as electricity", "Suspension responsiveness → Real-time damping adjustment (0.001 second reaction time)"],
   "realWorldExamples": ["Tesla Model S: Dual motor AWD with air suspension", "Hyundai Ioniq 5: Regenerative braking paddles with integrated EPS control", "Audi e-tron: Predictive active suspension with torque vectoring"]
 }'::jsonb,
 25),

-- Q10: Multiple-choice Hard
('q10', 'multiple-choice', 'specification', 'hard',
 'Which combination represents the correct actuators in a 6-axis industrial robot?',
 'Industrial Robot Actuators',
 '["A) Servo motors + Harmonic drive reducer, Encoder (position sensor)", "B) Servo motors + Harmonic drive reducer, Pneumatic gripper", "C) Encoder, Pneumatic gripper, PLC (control computer)", "D) Servo motors + Harmonic drive reducer, PLC controller"]'::jsonb,
 'B',
 '{
   "correct": "Servo motors with harmonic drives and pneumatic grippers are the actuators. Encoders are sensors (feedback), and PLCs are controllers. A complete 6-axis robot combines: servo motors (joint actuation) + pneumatic grippers (end effector) with encoder feedback and PLC control.",
   "improvements": ["Servo precision → ±0.02mm repeatability through high-resolution encoders", "Harmonic drive → Backlash under 1 arcminute for smooth operation", "Gripper response → 0.01 second pick-and-place cycle for assembly tasks"],
   "realWorldExamples": ["Welding robots: High-power servo (5-10kW) + rigid harmonic drives", "Assembly robots: Lightweight harmonic drives (1-3kW) for precision", "Handling robots: High-speed pneumatic grippers with vision system integration"]
 }'::jsonb,
 20),

-- Q11: True-False Easy
('q11', 'true-false', 'specification', 'easy',
 'Increasing the torque of an electric window actuator by 2x allows heavier glass windows to be operated more easily.',
 'Electric Window Torque',
 '["O", "X"]'::jsonb,
 'O',
 '{
   "correct": "True. Torque represents rotational force. Increased actuator torque enables heavier windows and larger-sized windows to operate smoothly.",
   "improvements": ["Real-world examples show compact actuators (5-10 Nm) for standard vehicles and high-torque actuators (15-20 Nm) for SUVs/large vehicles"],
   "realWorldExamples": ["Standard passenger car: Small actuator (5-10 Nm)", "SUV/large vehicle: High-torque actuator (15-20 Nm)", "Armored vehicle: Ultra-high-torque actuator (30+ Nm)", "Winter benefit: Frozen windows can still operate reliably", "Safety enhancement: Rapid response when obstacle detected"]
 }'::jsonb,
 15),

-- Q12: True-False Easy
('q12', 'true-false', 'specification', 'easy',
 'Improving industrial robot arm position precision from 0.1mm to 0.01mm enables more delicate assembly work.',
 'Robot Arm Precision',
 '["O", "X"]'::jsonb,
 'O',
 '{
   "correct": "True. 10-fold precision improvement enables much finer work. This is essential in semiconductor manufacturing, precision machining, and medical device production.",
   "improvements": ["Reduced defect rate → Lower production costs", "Faster work speed → Reduced rework time", "Access to new applications requiring tight tolerances"],
   "realWorldExamples": ["Electronics assembly (0.1mm precision): Smartphone component assembly", "Semiconductor manufacturing (0.01mm = 10μm precision): Wafer handling and chip bonding", "Medical devices (0.01mm+ precision): Surgical robots and dispensing systems"]
 }'::jsonb,
 15),

-- Q13: True-False Medium
('q13', 'true-false', 'specification', 'medium',
 'To increase e-scooter range, doubling the motor''s maximum power will improve battery efficiency and extend travel distance.',
 'E-scooter Motor Optimization',
 '["O", "X"]'::jsonb,
 'X',
 '{
   "correct": "False. Doubling max power doesn''t improve range - it often worsens it. Higher output requires more copper windings, adding weight and losses. Better efficiency comes from: (1) Motor efficiency improvement (85% → 92%), (2) Algorithm optimization (FOC control, Eco mode, enhanced regenerative braking), (3) Lightweight design (aluminum housing, reduced iron loss).",
   "improvements": ["Efficiency gains → 7% improvement yields 8-10% range increase", "Regenerative braking → 20% → 35% recovery increases city range 15-20%", "Lightweight construction → 20% weight reduction improves acceleration without range loss"],
   "realWorldExamples": ["Xiaomi Mi Scooter Pro 2: Efficiency improvements achieved 45km range", "Segway Ninebot Max: Regenerative braking + large battery = 65km capability", "Ather S1: Motor efficiency optimization without power increase"]
 }'::jsonb,
 20),

-- Q14: True-False Medium
('q14', 'true-false', 'specification', 'medium',
 'Doubling automotive windshield wiper motor speed will improve visibility without affecting motor lifespan or noise.',
 'Wiper Motor Design Trade-offs',
 '["O", "X"]'::jsonb,
 'X',
 '{
   "correct": "False. Speed doubling causes serious issues: (1) Centrifugal force increases 4x (proportional to speed squared), (2) Bearing wear accelerates → 30-50% lifespan reduction, (3) Air noise increases with speed cubed, (4) Brush sparking increases. Better solutions: Adaptive speed control (based on rain sensor), pressure optimization, and brushless motor design for durability.",
   "improvements": ["Adaptive speed control → 3-5 speed levels based on rainfall intensity", "Brushless motor → 3x longer lifespan with self-diagnostic capability", "Blade optimization → Graphite coating reduces friction and noise", "Temperature compensation → Prevents freezing without excess power"],
   "realWorldExamples": ["Mercedes-Benz: AI analyzes raindrops to optimize wiping pattern", "Tesla: Electronic wipers with variable speed + pressure control", "BMW: Temperature-compensated control with frost detection mode", "Data: Standard speed (60/min) lifespan 1M cycles vs 2x speed (120/min) lifespan 40-50K cycles"]
 }'::jsonb,
 20),

-- Q15: True-False Hard
('q15', 'true-false', 'specification', 'hard',
 'Reducing hospital bed actuator noise from 40dB to 30dB improves patient sleep quality.',
 'Medical Equipment Noise Control',
 '["O", "X"]'::jsonb,
 'O',
 '{
   "correct": "True. A 10dB reduction represents approximately a 50% perceived reduction in noise. Quieter actuators are essential in medical environments to maintain patient rest and recovery.",
   "improvements": ["Sleep quality → Uninterrupted patient recovery", "Stress reduction → Lower cortisol levels during hospitalization", "Better healing → Quality sleep accelerates recovery process"],
   "realWorldExamples": ["Low-noise medical actuators: 25-30dB (comparable to whisper)", "Silent actuators: Under 20dB (barely perceptible)", "Standard industrial actuators: 50-60dB (comparison: normal conversation)"]
 }'::jsonb,
 25);

-- Verify data insertion
SELECT COUNT(*) as total_questions FROM quiz_questions_cache;