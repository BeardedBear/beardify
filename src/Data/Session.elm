module Data.Session exposing (Session)

import Browser.Navigation as Nav
import Data.Player
import Data.Playlist exposing (PlaylistSimplified)
import Data.Search
import Url exposing (Url)

 
type alias Session =
    { navKey : Nav.Key
    , playlists : List PlaylistSimplified
    , url : Url
    , token : String
    , player : Data.Player.Model
    , search : Data.Search.Model
    }
