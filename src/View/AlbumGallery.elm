module View.AlbumGallery exposing (view)

import Data.Album exposing (..)
import Data.Image exposing (..)
import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import Utils


view : Player.Model -> List Album -> Html Msg
view player albums =
    let
        albumItem a =
            div
                [ classList
                    [ ( "album", True )
                    , ( "active", player.item.album.id == a.id )
                    ]
                ]
                [ div [ class "img", onClick (GetAlbum a.id) ] [ imageView Medium a.images ]
                , div [] [ text a.name ]
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")" ]
                , div [ class "playing-btn", onClick (ChangePlaying a.uri) ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn", onClick <| ModalGetTrack a.id ] [ i [ class "icon-plus-square" ] [] ]
                ]
    in
    albums
        |> List.map albumItem
        |> div [ class "album-list-wrapper" ]
