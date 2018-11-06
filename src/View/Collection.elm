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

        albumItem al =
            div
                [ classList
                    [ ( "album", True )
                    , ( "active", player.item.album.id == al.albumId )
                    ]
                ]
                [ div [ class "img", onClick (GetAlbum al.albumId) ] [ imageView Medium al.images ]
                , div [] [ text al.album ]
                , div [] (al.artists |> List.map (\ar -> a [ onClick (GetArtist ar.id), class "artist-name" ] [ text ar.name ]))
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")" ]
                , div [ class "playing-btn", onClick (ChangePlaying al.albumUri) ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn", onClick <| ModalGetTrack al.albumId ] [ i [ class "icon-add" ] [] ]
                , div [ class "del-btn", onClick <| DelCollectionAlbum collection.playlist.id (String.words al.trackUri) ] [ i [ class "icon-del" ] [] ]
                ]
    in
    div []
        [ div [ class "heading-page" ] [ text <| String.replace "#Collection " "" collection.playlist.name ]
        , div []
            [ albums
                |> List.map albumItem
                |> div [ class "album-list-wrapper" ]
            ]
        ]
