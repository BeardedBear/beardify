module View.Releases exposing (view)

import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import View.AlbumGallery as AlbumGallery exposing (..)


view : Player.Model -> Root.Model -> Html Msg
view player model =
    let
        test =
            model.releases.releaseList
                |> List.filter (\e -> e.release_date == "2018-09-28" && e.album_type == "album")
    in
    div []
        [ AlbumGallery.view player test
        ]
