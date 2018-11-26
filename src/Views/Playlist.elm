module Views.Playlist exposing (view)

import Data.Image as Image exposing (..)
import Data.Playlist exposing (..)
import Data.Root
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Route
import Utils


view : Data.Root.PlaylistModel -> Html msg
view model =
    div []
        [ text <| Debug.toString model
        ]
