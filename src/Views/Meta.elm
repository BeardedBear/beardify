module Views.Meta exposing (ActivePage(..), Config)

import Data.Session exposing (Session)


type ActivePage
    = Home
    | Counter
    | Collection
    | Playlist
    | Album
    | Artist
    | Other


type alias Config =
    { session : Session
    , activePage : ActivePage
    }
