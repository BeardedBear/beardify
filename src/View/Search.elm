module View.Search exposing (view)

import Data.Image as Image exposing (..)
import Data.Search as Search exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import Utils
import View.Artist exposing (..)


view : Search.Model -> Html Msg
view searchMsg =
    let
        artistItem a =
            div [ class "artist-item", onClick (GetArtist a.id) ]
                [ div [ class "img" ] [ imageView Small a.images ]
                , span [] [ text a.name ]
                ]

        albumItem al =
            div [ class "album-item" ]
                [ div [ class "search-cover-image", onClick (GetAlbum al.id) ] [ imageView Small al.images ]
                , div []
                    [ strong [ onClick (GetAlbum al.id) ] [ text <| al.name ++ " " ]
                    , text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")"
                    , div [] [ artistList al.artists ]
                    ]
                ]

        trackItem t =
            div [ class "track-item" ]
                [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ i [ class "icon-play" ] [] ]
                , div []
                    [ strong [] [ text t.name ]
                    , div [] [ artistList t.artists ]
                    ]
                , div []
                    [ text (Utils.durationFormat t.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div []
            [ input
                [ id "search"
                , placeholder "Recherche"
                , type_ "text"
                , onInput Query
                , Html.Attributes.value searchMsg.searchQuery
                ]
                []
            , if searchMsg.searchQuery /= "" then
                div [ class "results" ]
                    [ div []
                        [ div [ class "title" ] [ text "Artists" ]
                        , div [] (searchMsg.findArtist |> List.map artistItem)
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Albums" ]
                        , div []
                            (searchMsg.findAlbum
                                |> List.filter (\a -> a.album_type == "album")
                                |> List.map albumItem
                            )
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Tracks" ]
                        , div []
                            (searchMsg.findTrack |> List.map trackItem)
                        ]
                    ]

              else
                text ""
            ]
        , div [ class "help" ]
            [ i [ class "icon-question" ] []
            , div [ class "popup" ]
                [ div [ class "title" ] [ text "Raccourcis" ]
                , div [] [ text "SHIFT + F : Focus search bar" ]
                , div [] [ text "SPACEBAR : Play/Pause player" ]
                ]
            ]
        ]
