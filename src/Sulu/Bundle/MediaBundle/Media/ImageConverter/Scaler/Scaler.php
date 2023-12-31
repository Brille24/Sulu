<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\Media\ImageConverter\Scaler;

use Imagine\Image\Box;
use Imagine\Image\BoxInterface;
use Imagine\Image\ImageInterface;

/**
 * The class represents a scaler of an image, according to the interface it implements.
 */
class Scaler implements ScalerInterface
{
    public function scale(
        ImageInterface $image,
        $x,
        $y,
        $mode = ImageInterface::THUMBNAIL_OUTBOUND,
        $forceRatio = true,
        $retina = false
    ) {
        list($newWidth, $newHeight) = $this->getHeightWidth(
            $x,
            $y,
            $retina,
            $forceRatio,
            $image->getSize(),
            $mode
        );

        return $image->thumbnail(new Box($newWidth, $newHeight), $mode);
    }

    /**
     * Gets the height and width of the resulting image, according to the given parameters.
     *
     * @param int $x
     * @param int $y
     * @param bool $retina
     * @param bool $forceRatio
     * @param BoxInterface $size
     * @param int|string $mode
     *
     * @return int[]
     */
    private function getHeightWidth($x, $y, $retina, $forceRatio, $size, $mode)
    {
        $newWidth = $x;
        $newHeight = $y;

        // retina x2
        if ($retina) {
            $newWidth = $x * 2;
            $newHeight = $y * 2;
        }

        // calculate height when not set
        if (!$newHeight) {
            $newHeight = $size->getHeight() / $size->getWidth() * $newWidth;
        }

        // calculate width when not set
        if (!$newWidth) {
            $newWidth = $size->getWidth() / $size->getHeight() * $newHeight;
        }

        // if image is smaller keep ratio
        // e.g. when a square image is requested (200x200) and the original image is smaller (150x100)
        //      it still returns a squared image (100x100)
        if (ImageInterface::THUMBNAIL_OUTBOUND === $mode && $forceRatio) {
            if ($newWidth > $size->getWidth()) {
                list($newHeight, $newWidth) = $this->getSizeInSameRatio(
                    $newHeight,
                    $newWidth,
                    $size->getWidth()
                );
            }

            if ($newHeight > $size->getHeight()) {
                list($newWidth, $newHeight) = $this->getSizeInSameRatio(
                    $newWidth,
                    $newHeight,
                    $size->getHeight()
                );
            }
        }

        return [(int) \round($newWidth), (int) \round($newHeight)];
    }

    /**
     * @param int|float $size1
     * @param int|float $size2
     * @param int|float $originalSize
     *
     * @return array{0: int|float, 1: int|float}
     */
    private function getSizeInSameRatio($size1, $size2, $originalSize)
    {
        if ($size1) {
            $size1 = $size1 / $size2 * $originalSize;
        }

        $size2 = $originalSize;

        if ($size1 < 1) {
            $size1 = 1;
        }
        if ($size2 < 1) {
            $size2 = 1;
        }

        return [$size1, $size2];
    }
}
