module View.Album exposing (view)

import Data.Album exposing (..)
import Data.Drawer exposing (..)
import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Data.Pocket as Pocket exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)
import Utils
import View.Artist exposing (..)
import View.Pocket exposing (..)


view : Pocket.Model -> Player.Model -> AlbumModel -> Html Msg
view pocket player album =
    let
        listTracksUri id =
            album.tracks
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map (\k -> k.uri)

        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    , ( "active", t.uri == player.item.uri )
                    , ( "selected", List.member t.uri (pocket.tracks |> List.map .uri) )
                    ]
                ]
                [ View.Pocket.btnTrackSimplified pocket t
                , if t.uri == player.item.uri then
                    div [] [ i [ class "icon-play" ] [] ]

                  else
                    div [] [ i [ class "icon-music" ] [] ]
                , div [] [ text <| String.fromInt t.track_number ++ "." ]
                , div [ onClick <| ChangePlayingTrack (listTracksUri t.uri) ] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            album.tracks
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "bg-cover" ] [ imageView Large album.album.images ]
        , div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text album.album.name ]
            , div []
                [ span [] [ text "By " ]
                , artistList album.album.artists
                ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ div [ class "album" ]
                    [ div [ class "img" ]
                        [ imageView Large album.album.images
                        ]
                    , div [ class "playing-btn", onClick (ChangePlaying album.album.uri) ] [ i [ class "icon-play" ] [] ]
                    , div [ class "add-btn", onClick <| ModalGetTrack album.album.id ] [ i [ class "icon-add" ] [] ]
                    , div [] [ text <| Utils.releaseDateFormat album.album.release_date ]
                    , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                    ]
                ]
            , div []
                [ div [] (album.tracks |> List.map trackItem)
                ]
            ]
        ]
