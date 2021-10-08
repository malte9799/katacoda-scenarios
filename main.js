const express = require('express')
const session = require('express-session')
const hbs = require('express-handlebars')
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const path = require('path')
const passport = require('passport')
const Strategy = require('./lib').Strategy
// const { Client, Intents } = require('discord.js');
const Bot = require('./bot')
const client = Bot.client
require('dotenv').config();

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

// const music = require('../music')
const scopes = ['identify', 'guilds']

if (process.stdout._handle) process.stdout._handle.setBlocking(true);

const login = () => {
	ws = new WebSocket(client)
	console.log(`WebSocket client set up.`);

	console.log("Starting client!");
	// const client = new Discord.Client()
	client.once('ready', () => {
	});

	client.setup(process.env.token, ws);
}
class WebSocket {

	constructor(client) {
		this.config = config
		this.port = process.env.PORT || 5000
		this.app = express()
		this.client = client
		this.redirect = config.redirect;
		this.encoded_redirect = encodeURIComponent(this.redirect)
		this.app.engine('hbs', hbs({
			extname: 'hbs',
			defaultLayout: 'layout',
			layoutsDir: __dirname + '/layouts',
			partialsDir: __dirname + '/views/partials/'
		}))
		
		this.app.set('views', __dirname + '/views')
		this.app.set('view engine', 'hbs')

		// this.app.use(sassMiddleware({
		// 	src: path.join(__dirname, 'public'),
		// 	dest: path.join(__dirname, 'public'),
		// 	debug: true,
		// 	indentedSyntax: false,
		// 	outputStyle: 'compressed'
		// }));
		this.app.use(express.static(path.join(__dirname, 'public')));

		this.app.use(bodyParser.urlencoded({
			extended: false
		}))
		this.app.use(bodyParser.json())
		this.app.use(cookieParser());

		passport.serializeUser((user, done) => done(null, user))
		passport.deserializeUser((obj, done) => done(null, obj))

		passport.use(new Strategy({
			clientID: this.config.id,
			clientSecret: process.env.secret,
			callbackURL: this.redirect,
			scope: scopes
		}, (accessToken, refreshToken, profile, done) => {
			process.nextTick(() => {
				return done(null, profile)
			})
		}))

		this.app.use(session({
			secret: 'keyboard cat',
			resave: false,
			saveUninitialized: false
		}))
		this.app.use(passport.initialize())
		this.app.use(passport.session())

		this.registerRoots()

		this.server = this.app.listen(this.port, () => {
			console.log("Websocket API set up at port " + this.server.address().port)
		})
	}


	get_user_managed_servers(user) {
		return user.guilds.filter(g => ((g.owner == true) || ((parseInt(g.permissions) >> 5) & 1)));
	}

	checkAuth(req, res, next) {
		if (req.isAuthenticated()) return next()
		res.cookie('redirect' , req.originalUrl)
		return res.redirect('/login')
	}

	checkOwner(req, res, next) {
		if (config.owner.includes(req.user['id'])) return next()
		return res.redirect('/')
	}

	render_navbar() {
		return
	}

	registerRoots() {

		this.app.get('/discord', (req, res) => 		{return res.redirect('https://discord.gg/2xSsFXa')})
		this.app.get('/invite', (req, res) => 		{return res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${this.config.id}&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fcallback&scope=bot%20applications.commands`)})
		this.app.get('/invite/:id', (req, res) => 	{return res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${this.config.id}&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fcallback&scope=bot%20applications.commands&guild_id=${req.params.id}`)})


		this.app.get('/', (req, res) => {
			res.render('index', {
				user: req.user
			})
		})

		this.app.get('/test', (req, res) => {
			res.render('index', {
				user: req.user
			})
		})

		this.app.get('/login', (req, res, next) => {
			passport.authenticate('discord', {
				scope: scopes,
			})(req, res, next);
		})

		this.app.get('/callback',
			passport.authenticate('discord', {
				failureRedirect: '/'
			}),
			(req, res) => {
				if ('redirect' in req.cookies && req.cookies['redirect'] != "") {
					return res.cookie('redirect' , '').redirect(req.cookies['redirect'])
				} else
					return res.redirect(`/`)
			}
		)

		this.app.get('/logout', (req, res) => {
			req.logout()
			return res.redirect('/')
		})


		// this.app.get('/me', this.checkAuth, (req, res) => {
		// 	res.render('user', {
		// 		user: req.user
		// 	})
		// })

		// this.app.get('/:id', this.checkAuth, (req, res) => {
		// 	if (!req.params.id) return res.redirect('/');
		// 	let guild = this.client.guilds.get(req.params.id);
		// 	if (!guild) {
		// 		res.cookie('redirect', `/invite/${req.params.id}`)
		// 		return res.redirect(`/invite/${req.params.id}`);
		// 	}

		// 	let player = music.voice_player_ws(this.client, req.params.id)

		// 	res.render('user', {
		// 		user: req.user,
		// 		guild: guild,
		// 		player: player
		// 	})
		// })
	}

}

login()
// exports.WebSocket = WebSocket
// exports.login = login
