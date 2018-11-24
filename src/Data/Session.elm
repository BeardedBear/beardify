module Data.Session exposing (Session)

import Browser.Navigation as Nav
import Data.Playlist exposing (..)


type alias Session =
    { navKey : Nav.Key
    , playlists : List PlaylistSimplified
    }
