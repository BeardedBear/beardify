module View.Collection exposing (view)

import Drawer exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Image exposing (..)
import Player exposing (..)
import Playlist exposing (..)
import Root exposing (..)
import Utils
import View.AlbumGallery as AlbumGallery exposing (..)


view : Player.Model -> PlaylistModel -> Html Msg
view player collection =
    let
        albums =
            collection.playlist.tracks.items
                |> List.map
                    (\a ->
                        { artists = a.track.artists
                        , album = a.track.album.name
                        , albumId = a.track.album.id
                        , albumUri = a.track.album.uri
                        , release_date = a.track.album.release_date
                        , images = a.track.album.images
                        }
                    )

        albumItem a =
            div
                [ classList
                    [ ( "album", True )
                    , ( "active", player.item.album.id == a.albumId )
                    ]
                ]
                [ div [ onClick (GetA a.albumId) ] [ imageView Medium a.images ]
                , div [] [ text a.album ]
                , div [] (a.artists |> List.map (\ar -> span [ class "artist-name" ] [ text ar.name ]))
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")" ]
                , div [ class "playing-btn", onClick (ChangePlaying a.albumUri) ] [ i [ class "icon-play" ] [] ]
                ]
    in
    div []
        [ div [ class "heading-page" ] [ text collection.playlist.name ]
        , div []
            [ albums
                |> List.map albumItem
                |> div [ class "album-list-wrapper" ]
            ]
        ]
