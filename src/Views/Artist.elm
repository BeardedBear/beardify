module Views.Artist exposing (artistList, view)

import Data.Artist
import Data.Image as Image exposing (..)
import Data.Meta
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import List.Extra as LE
import Route
import Utils
import Views.AlbumGallery


artistList : List Data.Artist.ArtistSimplified -> Html msg
artistList artists =
    artists
        |> List.map (\ar -> a [ Route.href (Route.Artist ar.id) ] [ text ar.name ])
        |> List.intersperse (span [] [ text ", " ])
        |> span [ class "artist-name" ]


view : Data.Meta.ArtistModel -> Html msg
view model =
    let
        listTracksUri id =
            model.topTracks
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map .uri

        trackItem t =
            div
                [ classList
                    [ ( "track", True )
                    ]
                ]
                [ div [] [ imageView Small t.album.images ]
                , div [] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        relatedArtistItem r =
            a [ class "related-artist", Route.href (Route.Artist r.id) ]
                [ div [] [ imageView Small r.images ]
                , div [] [ text r.name ]
                ]

        videoFrame v =
            div [ class "video-frame" ]
                [ iframe [ class "video", attribute "allowfullscreen" "", attribute "frameborder" "0", width 250, height 140, src <| "https://www.youtube.com/embed/" ++ v.id.videoId ] []
                , div [ class "video-title" ] [ text v.snippet.title ]
                , div [ class "artist-name" ] [ a [ target "_BLANK", href ("https://www.youtube.com/channel/" ++ v.snippet.channelId) ] [ text v.snippet.channelTitle ] ]
                ]

        link name urlBefore urlAfter icon =
            a [ href <| urlBefore ++ model.artist.name ++ urlAfter, target "_BLANK" ] [ i [ class <| "icon-" ++ icon ] [], text name ]
    in
    div [ class "artist-wrapper" ]
        [ div []
            [ div [ class "heading-page" ] [ text model.artist.name ]
            , div [ class "links" ]
                [ link "Wikipedia" "https://fr.wikipedia.org/wiki/" "" "wikipedia"
                , link "Sputnik" "https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=" "&x=0&y=0" "sputnik"
                , link "Discogs" "https://www.discogs.com/fr/search/?q=" "&type=artist&strict=true" "discogs"
                , link "LastFM" "https://www.last.fm/fr/music/" "" "lastfm"
                ]
            , div [ class "artist-head" ]
                [ div [ class "top-tracks" ]
                    [ div [ class "sub-title" ] [ text "Top tracks" ]
                    , div [] (model.topTracks |> List.take 5 |> List.map trackItem)
                    ]
                , div []
                    [ div [ class "sub-title" ] [ text "Similar artists" ]
                    , div [ class "related-artists" ] (model.relatedArtists |> List.take 4 |> List.map relatedArtistItem)
                    ]
                ]
            , div [ class "sub-title" ] [ text "Albums" ]
            , Views.AlbumGallery.view model.albums
            ]
        , div [ class "video-wrapper" ]
            [ div [ class "sub-title" ] [ text "Videos" ]
            , div [] (model.videos |> List.map videoFrame)
            ]
        ]
