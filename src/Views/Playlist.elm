module Views.Playlist exposing (view)

import Data.Image as Image exposing (..)
import Data.Playlist exposing (..)
import Data.Root
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import List.Extra as LE
import Route
import Utils
import Views.Artist


view : Data.Root.PlaylistModel -> Html msg
view model =
    let
        listTracksUri id =
            model.tracks.items
                |> LE.dropWhile (\e -> e.track.uri /= id)
                |> List.map (\k -> k.track.uri)

        trackItem t =
            let
                icon =
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
                    ]
                ]
                [ span [] []
                , icon
                , div
                    [ class "track-title"
                    , title t.track.name
                    ]
                    [ text t.track.name ]
                , div [ class "track-artist" ] [ Views.Artist.artistList t.track.artists ]
                , div [ class "track-album", title t.track.album.name ]
                    [ releaseType t.track.album.album_type
                    , a [] [ text t.track.album.name ]
                    ]
                , div [] [ text (Utils.durationFormat t.track.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks.items
                |> List.map (\d -> d.track.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text model.playlist.name ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ imageView Medium model.playlist.images
                , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                ]
            , div []
                [ div [] (model.tracks.items |> List.map trackItem)
                ]
            ]
        ]
