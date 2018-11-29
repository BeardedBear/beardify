module Views.Collection exposing (view)

import Data.Image
import Data.Meta
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Route
import Utils


view : Data.Meta.CollectionModel -> Html msg
view model =
    let
        albums =
            model.albums.items
                |> List.map
                    (\a ->
                        { artists = a.track.artists
                        , album = a.track.album.name
                        , albumId = a.track.album.id
                        , albumUri = a.track.album.uri
                        , release_date = a.track.album.release_date
                        , images = a.track.album.images
                        , trackUri = a.track.uri
                        }
                    )

        albumItem al =
            div [ classList [ ( "album", True ) ] ]
                [ a [ Route.href (Route.Album al.albumId), class "img" ] [ Data.Image.imageView Data.Image.Medium al.images ]
                , div [] [ text al.album ]
                , div []
                    (al.artists
                        |> List.map
                            (\ar ->
                                a
                                    [ Route.href (Route.Artist ar.id)
                                    , class "artist-name"
                                    ]
                                    [ text ar.name ]
                            )
                    )
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")" ]
                , div [ class "playing-btn" ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                , div [ class "del-btn" ] [ i [ class "icon-del" ] [] ]
                ]
    in
    div []
        [ div [ class "heading-page" ] [ text <| String.replace "#Collection " "" model.collection.name ]
        , div []
            [ albums
                |> List.map albumItem
                |> div [ class "album-list-wrapper" ]
            ]
        ]
