# 00018441

The project name is CSConfig - an app that allows users to share Counter Strike 2
configurations, including hardware settings like monitor and videocard preferences,
furniture like desks and chairs and headphones, in-game settings like mouse pointer speed and
various keybinds. Unfortunately due to time constraints I wan't able to implement all of the
features I originally intended so users will have to share all settings in post descriptions for now).

Here is the Elastic IP address of my AWS EC2 instance where the project is deployed: `52.55.129.8`
Github Repo: `https://github.com/00018441/WebTechCW2`

## Project setup

This project was developed exclusively using Docker containers for their
isolation and ease of use.

There are five available containers:

1. db (PostgreSQL with a volume)
2. app (The main ExpressJS application)
3. grafana (I have put quite a bit of work into building some robust loging btw)
4. Loki (Simple to use log aggregator)
5. Promtail (Processes and pushes logs to the Loki instance)

If you don't have the time to look at the nice Grafana's UI and my logs there,
feel free to not run those containers.

### Prerequisites:

- Docker / Podman Desktop installed locally
- Node v22+ (highly recommended)
- Good internet
- Some patience

### Running locally:

To spin up the base app and database, run:

```
docker [podman] compose up app db --detach
```

Just add `grafana`, `promtail`, and `loki` to that list if you need logging.

Next step is running db migrations:

1. Please run (I hope you are using Unix based machine otherwise God help you):

- This is to create the migrations table (which keeps track of all applied migrations):

```
cat ./postgresql/V000_create_migrations_table.sql | podman compose exec -T db psql -U tiescl -d csconfig
```

- This is to actually run the migrations:

```
echo 'node scripts/migrate.js' | docker [podman] compose exec -T app sh
```

2. Now you need to generate database queries and htmx responses (I used htmx btw) using the scripts I prepared:

Note: you need to be at project root for this to work, or you can provide relative paths to ./scripts folder

```
node scripts/codegen-sql.js && node scripts/codegen-ejs.js
```

3. Populate environment variables from .env.example file

Here is mine (variables marked with !important should better be left that way):

```
   NODE_PORT=6969
   NODE_ENV=development              !important
   DB_PORT=5432                      !important
   DB_USER=user
   DB_PASSWORD=password
   DB_HOST=db                        !important
   DB_NAME=csconfig                  !recommended
   SECRET_JWT_KEY=anything
   AUTH_TOKEN_EXPIRES_IN_MS=86400000 !recommended
```

4. Finally, run `npm install` from project root to install the dependencies.
   With that said, you should be good to try the curl scripts I prepared (or just use the browser)

## Project structure justification

As I learned a whole bunch of stuff during the process, I struggled to efficiently organize the files.
Nevertheless, I think it turned out ok.

1. configs folder primary contains stuff related to configuring logging
2. postgresql folder stores migrations
3. scripts has some utility scripts related to codegen, migrations, and "curl"ing
4. src -- the main entrypoint to the app
    - db contains all of the database queries used by the app
    - `app.js` and `index.js` are where the express app is set up and configured, along with all routes and middlewares
    - modules is probably the biggest one. there are 3 main modules: posts, users, and auth. each module has its own controller,
      which receives the requests, and a service that does the heavy lifting and going to db. I honestly think separating modules
      based on logic they do is better than having common controllers and services directories, this seems to provide more isolation
      and atomicity. anyway, every person has their own taste. each module also has a directory called minions - those are small ejs snippets
      that I parameterize and send to the client, thanks to the amazing library called `htmx`. next is schemas (those primarily describe
      validation mechanisms handled by `zod` library).
    - public stores all assets: css, js, and fonts
    - shared contains, utility functions, middlewares, errors, constants, and validators used throughout the app
    - views has the main landing and home pages that are rendered when entering the app

## Some main features of the app

1. Secure JWT based authentication. `bcrypt` library is used for password hashing.
2. Users page for admins. It has efficient searching mechanism to filter users by usernames and
   allows deletion of users. you can enter the following credentials in prod to login as one:

- email: primeagen@aol.com
- password: donthackme

3. Every username can be hovered upon to see a nice little tooltip that shows some basic information about the user.

4. Post creation page. Allows entering the title and description (or you can think of it as main post content).

5. Public posts list visible to all users. If you create enough posts (15+), there will appear a
   "Load More" button that will dynamically fetch more posts on pressing. By the way, the searching of posts by title and description
   are quite efficient as well thanks to clever algorithms used by PostgreSQL for indexing (last migration btw, I also hate ORM btw).

6. Nice landing page. I am also quite proud of the overall design -- it suits the project idea.

## A note about logging and why I chose codegen

This whole story is inspired by one of the companies where I am currently working. We have much, much better logging and beautiful
dashboards to monitor all metrics emitted by each of the microservices. So I decided to try to set up something like that on my own,
and it works! And the reason why I chose HTMX is of course: `https://www.youtube.com/watch?v=x7v6SNIgJpE`
