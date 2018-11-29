module Views.AlbumGallery exposing (view)

import Data.Album
import Data.Image
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Route
import Utils


view : List Data.Album.Album -> Html msg
view albums =
    let
        albumItem ar =
            div
                [ classList
                    [ ( "album", True )
                    ]
                ]
                [ a
                    [ class "img"
                    , Route.href (Route.Album ar.id)
                    ]
                    [ Data.Image.imageView Data.Image.Medium ar.images
                    ]
                , div [] [ text ar.name ]
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat ar.release_date ++ ")" ]
                , div [ class "playing-btn" ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                ]
    in
    albums
        |> List.map albumItem
        |> div [ class "album-list-wrapper" ]
