module View.AlbumGallery exposing (view)

import Album exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Image exposing (..)
import Player exposing (..)
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
                [ div [ onClick (GetA a.id) ] [ imageView Medium a.images ]
                , div [] [ text a.name ]
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")" ]
                , div [ class "playing-btn", onClick (ChangePlaying a.uri) ] [ i [ class "icon-play" ] [] ]
                ]
    in
    albums
        |> List.map albumItem
        |> div [ class "album-list-wrapper" ]
