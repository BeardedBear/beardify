module Data.Session exposing (Session)

import Browser.Navigation as Nav
import Data.Device exposing (Device)
import Data.Player exposing (PlayerModel)
import Data.Playlist exposing (PlaylistSimplified)
import Data.Search
import Url exposing (Url)


type alias Session =
    { navKey : Nav.Key
    , playlists : List PlaylistSimplified
    , url : Url
    , token : String
    , player : PlayerModel
    , search : Data.Search.Model
    , devices : List Device
    }
