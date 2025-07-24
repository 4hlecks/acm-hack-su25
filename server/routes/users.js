// register route for students
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  const user = new User({ name, email, password, role: 'user' });
  await user.save();
  res.status(201).json({ message: 'User registered successfully.' });
});

// register route for clubs
router.post('/club/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email.endsWith('@ucsd.edu')) {
    return res.status(403).json({ message: 'UCSD email required for club registration.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  const user = new User({
    name,
    email,
    password,
    role: 'club',
    approved: false
  });

  await user.save();
  res.status(201).json({ message: 'Club registration submitted for approval.' });
});

