module View.Collection exposing (view)

import Data.Drawer exposing (..)
import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
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
                        , trackUri = a.track.uri
                        }
                    )

        albumItem a =
            div
                [ classList
                    [ ( "album", True )
                    , ( "active", player.item.album.id == a.albumId )
                    ]
                ]
                [ div [ class "img", onClick (GetAlbum a.albumId) ] [ imageView Medium a.images ]
                , div [] [ text a.album ]
                , div [] (a.artists |> List.map (\ar -> span [ class "artist-name" ] [ text ar.name ]))
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")" ]
                , div [ class "playing-btn", onClick (ChangePlaying a.albumUri) ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn", onClick <| ModalGetTrack a.albumId ] [ i [ class "icon-plus-square" ] [] ]
                , div [ class "del-btn", onClick <| DelCollectionAlbum collection.playlist.id (String.words a.trackUri) ] [ i [ class "icon-minus-square" ] [] ]
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
