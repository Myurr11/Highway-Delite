-- Highway Delite Database Setup
-- Run: psql -d highway -f src/db/init.sql

-- ==========================================
-- PART 1: CREATE SCHEMA
-- ==========================================

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  badge VARCHAR(100),
  min_age INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  experience_id VARCHAR(100) REFERENCES experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 10,
  booked_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_capacity CHECK (booked_count <= total_capacity),
  UNIQUE(experience_id, date, time)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  ref_id VARCHAR(50) UNIQUE NOT NULL,
  experience_id VARCHAR(100) REFERENCES experiences(id),
  slot_id INTEGER REFERENCES slots(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  promo_code VARCHAR(50),
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
  code VARCHAR(50) PRIMARY KEY,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences(location);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(active);
CREATE INDEX IF NOT EXISTS idx_slots_experience_date ON slots(experience_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_ref_id ON bookings(ref_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to experiences table
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Database schema created successfully!';

-- ==========================================
-- PART 2: SEED DATA --
-- ==========================================

-- Clear existing data
TRUNCATE TABLE bookings, slots, promo_codes, experiences CASCADE;

INSERT INTO experiences (id, title, location, price, image, description, full_description, min_age) VALUES
('kayak-udupi', 'Kayaking', 'Udupi', 999, 'https://plus.unsplash.com/premium_photo-1661893427047-16f6ddc173f6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340', 
 'Curated small-group experience. Certified guide. Safety first with gear included.',
 'Helmet and Life jackets along with an expert will accompany in kayaking. Scenic routes, trained guides, and safety briefing.',
 10),
 
('nandi-hills', 'Nandi Hills Sunrise', 'Bangalore', 899, 'https://images.unsplash.com/photo-1747321752407-2e247fb3b705?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2274',
 'Witness breathtaking sunrise views with guided tour.',
 'Early morning trip to witness breathtaking sunrise views from Nandi Hills. Includes guided tour and breakfast.',
 5),
 
('coffee-trail', 'Coffee Trail', 'Coorg', 1299, 'https://images.unsplash.com/photo-1633275755840-b0f61a020a3d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1364',
 'Explore coffee plantations and learn about cultivation.',
 'Explore coffee plantations and learn about coffee cultivation from bean to cup. Includes coffee tasting session.',
 8),
 
('boat-cruise', 'Boat Cruise', 'Sunderban', 999, 'https://images.unsplash.com/photo-1638123657021-f9aca72f8caf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2784',
 'Scenic boat ride through pristine waters.',
 'Scenic boat ride through pristine waters of Sunderban. Wildlife spotting and mangrove forest exploration.',
 5),
 
('bunjee-jumping', 'Bunjee Jumping', 'Manali', 1999, 'https://images.unsplash.com/photo-1549221360-456a9c197d5b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2948',
 'Experience the ultimate adrenaline rush.',
 'Professional bungee jumping with safety equipment and medical screening. For thrill seekers only.',
 18),

('kayak-karnataka', 'Kayaking', 'Udupi, Karnataka', 999, 'https://images.unsplash.com/photo-1480480565647-1c4385c7c0bf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2662',
 'Curated small-group experience. Certified guide. Safety first with gear included.',
 'Helmet and Life jackets along with an expert will accompany in kayaking. Experience the thrill of paddling through serene waters.',
 10),

 ('paragliding-bir', 'Paragliding', 'Bir Billing, Himachal Pradesh', 2499, 'https://images.unsplash.com/photo-1592208128295-5aaa34f1d72b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Soar above the Himalayas with certified pilots.', 
 'Fly tandem with certified pilots over the scenic Bir Billing valley. Includes safety briefing, GoPro video, and transport to launch point.', 
 12),

('scuba-goa', 'Scuba Diving', 'Goa', 2999, 'https://plus.unsplash.com/premium_photo-1661894232140-73d96a67731b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Dive into the Arabian Sea with PADI-certified instructors.', 
 'Experience the underwater world with professional instructors. Includes training, scuba gear, and underwater photography.', 
 10),

('desert-camp', 'Desert Camping', 'Jaisalmer, Rajasthan', 1599, 'https://images.unsplash.com/photo-1613169620329-6785c004d900?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Spend a night under the stars in the Thar Desert.', 
 'Enjoy traditional Rajasthani food, camel rides, and cultural performances. Overnight stay in luxury tents.', 
 15),

('trek-harishchandragad', 'Harishchandragad Trek', 'Ahmednagar, Maharashtra', 999, 'https://images.unsplash.com/photo-1583477041518-b244705d89e1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Trek to the ancient fort with stunning Konkan views.', 
 'Guided trek to Harishchandragad fort. Includes transportation, meals, and first aid. Perfect for adventure lovers.', 
 20),

('rafting-rishikesh', 'River Rafting', 'Rishikesh, Uttarakhand', 1199, 'https://images.unsplash.com/photo-1627241129356-137242cf14f0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3034', 
 'White-water rafting on the Ganges with safety experts.', 
 'Conquer Grade III rapids under expert supervision. Includes life jackets, helmets, and GoPro video.', 
 10),

('camping-pawna', 'Lakeside Camping', 'Pawna Lake, Maharashtra', 899, 'https://plus.unsplash.com/premium_photo-1681496294786-bf795abb18a7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Unwind by the lake with BBQ and bonfire.', 
 'Lakeside tents, BBQ, and live music by the campfire. Ideal weekend getaway near Lonavala.', 
 25),

('ski-gulmarg', 'Skiing Adventure', 'Gulmarg, Jammu & Kashmir', 3499, 'https://plus.unsplash.com/premium_photo-1661868371660-eac62d15361f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Hit the slopes in India’s premier ski destination.', 
 'Learn skiing from certified instructors. Includes gear, safety briefing, and lift pass.', 
 8),

('caving-meghalaya', 'Cave Exploration', 'Cherrapunji, Meghalaya', 1699, 'https://plus.unsplash.com/premium_photo-1661897264411-9d1915616451?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Explore hidden limestone caves of Meghalaya.', 
 'Guided spelunking adventure through Mawmluh caves. Safety equipment and helmets included.', 
 6),

('jeep-safari', 'Wildlife Jeep Safari', 'Jim Corbett National Park, Uttarakhand', 1399, 'https://images.unsplash.com/photo-1759355580767-461849197aad?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2938', 
 'Spot tigers and elephants in their natural habitat.', 
 'Early morning jeep safari with naturalist guide. Includes park entry fees and refreshments.', 
 10),

('surf-kovalam', 'Surfing Lessons', 'Kovalam, Kerala', 1299, 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940', 
 'Ride the waves with certified surf coaches.', 
 'Beginner-friendly surf lessons with safety gear. Includes board rental and beachside refreshments.', 
 8);

-- Insert slots for next 7 days for each experience
DO $$
DECLARE
  exp_record RECORD;
  slot_date DATE;
  slot_time TEXT;
  day_offset INTEGER;
BEGIN
  FOR exp_record IN SELECT id FROM experiences LOOP
    FOR day_offset IN 0..6 LOOP
      slot_date := CURRENT_DATE + day_offset;
      FOREACH slot_time IN ARRAY ARRAY['07:00 am', '09:00 am', '11:00 am', '01:00 pm'] LOOP
        INSERT INTO slots (experience_id, date, time, total_capacity, booked_count)
        VALUES (
          exp_record.id, 
          slot_date, 
          slot_time,
          CASE 
            WHEN slot_time = '07:00 am' THEN 10
            WHEN slot_time = '09:00 am' THEN 8
            WHEN slot_time = '11:00 am' THEN 12
            ELSE 6
          END,
          CASE 
            WHEN slot_time = '01:00 pm' THEN 6
            WHEN slot_time = '09:00 am' THEN 6
            WHEN slot_time = '07:00 am' THEN 6
            ELSE 0
          END
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Insert promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, active, valid_from, valid_until) VALUES
('SAVE10', 'percentage', 0.10, true, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '90 days'),
('FLAT100', 'fixed', 100, true, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '90 days'),
('WELCOME20', 'percentage', 0.20, true, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days');

-- Insert sample booking
INSERT INTO bookings (ref_id, experience_id, slot_id, customer_name, customer_email, quantity, total_amount, status)
SELECT 
  'HUF' || upper(substr(md5(random()::text), 1, 5)),
  'kayak-udupi',
  (SELECT id FROM slots WHERE experience_id = 'kayak-udupi' ORDER BY date, time LIMIT 1),
  'John Doe',
  'john@example.com',
  2,
  2098.00,
  'confirmed';

-- Display summary
DO $$
DECLARE
  exp_count INTEGER;
  slot_count INTEGER;
  promo_count INTEGER;
  booking_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exp_count FROM experiences;
  SELECT COUNT(*) INTO slot_count FROM slots;
  SELECT COUNT(*) INTO promo_count FROM promo_codes;
  SELECT COUNT(*) INTO booking_count FROM bookings;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📦 Experiences: %', exp_count;
  RAISE NOTICE '📅 Slots: %', slot_count;
  RAISE NOTICE '💳 Promo Codes: %', promo_count;
  RAISE NOTICE '📋 Bookings: %', booking_count;
  RAISE NOTICE '';
  RAISE NOTICE '💡 Test Promo Codes:';
  RAISE NOTICE '   - SAVE10 (10%% off)';
  RAISE NOTICE '   - FLAT100 (₹100 off)';
  RAISE NOTICE '   - WELCOME20 (20%% off)';
  RAISE NOTICE '========================================';
END $$;