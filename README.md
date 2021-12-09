# Beardify

## Features

- Collections
- Easier and faster search
- UI more compact than official client

## Roadmap

- [x] Add songs to song playlists
- [x] Sharing
- [ ] Integrate my other client to check the new album releases

## Collections

Beardify is a Spotify web client that fixes one of the biggest issues for me: the possibility to create **album playlists** (called "Collections" in Beardify) in addition to **song playlists**.

<img src="https://github.com/BeardedBear/beardify/blob/master/public/img/readme/collection.png" />

## Artist vue

Beardify also adds other features that I feel are missing, like **artist related links**, and a **more readable view of their discography** than the current official client.

<img src="https://github.com/BeardedBear/beardify/blob/master/public/img/readme/artist.png" />

## Search

In the official client, the search returns information that doesn't interest me, so I made sure to keep only the essential, in a compact view

<img src="https://github.com/BeardedBear/beardify/blob/master/public/img/readme/search.png" />

## The trick

The trick is to base it on the user's playlists, and check if the keyword "#Collection" exists in the name, and if it does, it becomes a collection. The advantage is that we can transform on the fly existing playlists of songs into a collection and vice versa, and that I do not break the current organization of users, since they are only "classic" playlists.

## Technical restrictions:

Spotify's web API doesn't expose folder management, so I can't manage them on my end, so the playlist is flat.

Spotify web API does not allow non-premium users

## Dev

### Project setup

```
yarn install
```

#### Compiles and hot-reloads for development

```
yarn serve
```

#### Compiles and minifies for production

```
yarn build
```

#### Lints and fixes files

```
yarn lint
```

#### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
