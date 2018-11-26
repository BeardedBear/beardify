module Data.Root exposing
    ( AlbumModel
    , ArtistModel
    , CollectionModel
    )

import Data.Album
import Data.Artist
import Data.Playlist
import Data.Track
import Data.Youtube


type alias CollectionModel =
    { collection : Data.Playlist.Playlist
    , albums : Data.Playlist.PlaylistPaging
    }


type alias AlbumModel =
    { album : Data.Album.Album
    , tracks : List Data.Track.TrackSimplified
    }


type alias ArtistModel =
    { artist : Data.Artist.Artist
    , albums : List Data.Album.Album
    , videos : List Data.Youtube.Video
    , topTracks : List Data.Track.Track
    , relatedArtists : List Data.Artist.Artist
    }