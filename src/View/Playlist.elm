module View.Playlist exposing (view)

import Data.Album exposing (..)
import Data.Drawer exposing (..)
import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)
import Utils
import View.Artist exposing (..)


view : Player.Model -> PlaylistModel -> Html Msg
view player playlist =
    let
        listTracksUri id =
            playlist.tracks.items
                |> LE.dropWhile (\e -> e.track.uri /= id)
                |> List.map (\k -> k.track.uri)

        trackItem t =
            let
                icon =
                    if t.track.uri == player.item.uri then
                        div [] [ i [ class "icon-play" ] [] ]

                    else
                        div [] [ i [ class "icon-music" ] [] ]

                releaseType r =
                    case r of
                        "album" ->
                            i [ class "icon-discogs" ] []

                        "single" ->
                            i [ class "icon-pizza" ] []

                        _ ->
                            i [ class "icon-music" ] []
            in
            div
                [ classList
                    [ ( "track playlist-page", True )
                    , ( "active", t.track.uri == player.item.uri )
                    ]
                ]
                [ icon
                , div [ onClick <| ChangePlayingTrack (listTracksUri t.track.uri) ] [ text t.track.name ]
                , div [] [ artistList t.track.artists ]
                , div [ title t.track.album.album_type ]
                    [ releaseType t.track.album.album_type
                    , a [ onClick (GetAlbum t.track.album.id) ] [ text t.track.album.name ]
                    ]
                , div [] [ text (Utils.durationFormat t.track.duration_ms) ]
                ]

        trackSumDuration =
            playlist.tracks.items
                |> List.map (\d -> d.track.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text playlist.playlist.name ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ imageView Medium playlist.playlist.images
                , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                ]
            , div []
                [ div [] (playlist.tracks.items |> List.map trackItem)
                ]
            ]
        ]
