module Views.Meta exposing (ActivePage(..), Config)

import Data.Session


type ActivePage
    = Home
    | Counter
    | Collection
    | Playlist
    | Album
    | Artist
    | Other


type alias Config =
    { session : Data.Session.Session
    , activePage : ActivePage
    }
