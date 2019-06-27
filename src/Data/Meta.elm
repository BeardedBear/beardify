module Data.Meta exposing
    ( AlbumModel
    , ArtistModel
    , CollectionModel
    , PlaylistModel
    )

import Data.Album
import Data.Artist
import Data.Modal
import Data.Playlist
import Data.Track
import Data.Youtube


type alias CollectionModel =
    { collection : Data.Playlist.Playlist
    , albums : Data.Playlist.PlaylistPaging
    }


type alias PlaylistModel =
    { playlist : Data.Playlist.Playlist
    , tracks : Data.Playlist.PlaylistPaging
    }


type alias AlbumModel =
    { album : Data.Album.Album
    , tracks : Data.Track.TrackSimplifiedPaging
    , modal : Data.Modal.Model
    }


type alias ArtistModel =
    { artist : Data.Artist.Artist
    , albums : List Data.Album.Album
    , videos : List Data.Youtube.Video
    , topTracks : List Data.Track.Track
    , relatedArtists : List Data.Artist.Artist
    }
