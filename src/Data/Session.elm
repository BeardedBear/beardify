module Data.Session exposing (Session)

import Browser.Navigation as Nav
import Data.Modal
import Data.Player
import Data.Playlist
import Data.Search
import Url exposing (Url)


type alias Session =
    { navKey : Nav.Key
    , playlists : List Data.Playlist.PlaylistSimplified
    , url : Url
    , token : String
    , player : Data.Player.Model
    , search : Data.Search.Model

    -- , modal : Data.Modal.Model
    }
