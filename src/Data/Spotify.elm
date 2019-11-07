module Data.Spotify exposing (scope)


scope : List String
scope =
    [ "user-read-private"
    , "user-modify-playback-state"
    , "user-read-playback-state"
    , "user-read-currently-playing"
    , "playlist-read-private"
    , "playlist-read-collaborative"
    , "playlist-modify-private"
    , "playlist-modify-public"
    , "user-follow-modify"
    , "user-follow-read"
    ]
