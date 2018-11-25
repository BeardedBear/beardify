module Data.Collection exposing (Model)

import Data.Playlist as Playlist exposing (..)


type alias Model =
    { collection : Playlist
    , albums : PlaylistPaging
    }
