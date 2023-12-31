<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\Media\ImageConverter\Focus;

use Imagine\Image\Box;
use Imagine\Image\ImageInterface;
use Imagine\Image\Point;

/**
 * Calculate the crop for the given image based on the give focus point.
 */
class Focus implements FocusInterface
{
    /**
     * 0 is the x value if the focus point is set on the most left column.
     */
    public const FOCUS_LEFT = 0;

    /**
     * 1 is the x value if the focus point is set on the center column.
     */
    public const FOCUS_CENTER = 1;

    /**
     * 2 is the x value if the focus point is set on the most right column.
     */
    public const FOCUS_RIGHT = 2;

    /**
     * 0 is the y value if the focus point is set on the most top row.
     */
    public const FOCUS_TOP = 0;

    /**
     * 1 is the y value if the focus point is set on the middle row.
     */
    public const FOCUS_MIDDLE = 1;

    /**
     * 2 is the y value if the focus point is set on the most bottom row.
     */
    public const FOCUS_BOTTOM = 2;

    public function focus(ImageInterface $image, $x, $y, $width, $height)
    {
        $x = (null !== $x) ? $x : static::FOCUS_CENTER;
        $y = (null !== $y) ? $y : static::FOCUS_MIDDLE;
        $imageSize = $image->getSize();

        $currentRatio = $imageSize->getWidth() / $imageSize->getHeight();
        $targetRatio = $currentRatio;
        if (null !== $width && null !== $height) {
            $targetRatio = $width / $height;
        }

        if ($targetRatio < $currentRatio) {
            $height = $imageSize->getHeight();
            $width = $targetRatio * $height;

            $cropY = 0;

            switch ($x) {
                case static::FOCUS_LEFT:
                    $cropX = 0;
                    break;
                case static::FOCUS_RIGHT:
                    $cropX = $imageSize->getWidth() - $width;
                    break;
                case static::FOCUS_CENTER:
                default:
                    $cropX = ($imageSize->getWidth() - $width) / 2;
                    break;
            }
        } else {
            $width = $imageSize->getWidth();
            $height = (int) \round($width / $targetRatio);

            $cropX = 0;

            switch ($y) {
                case static::FOCUS_TOP:
                    $cropY = 0;
                    break;
                case static::FOCUS_BOTTOM:
                    $cropY = $imageSize->getHeight() - $height;
                    break;
                case static::FOCUS_MIDDLE:
                default:
                    $cropY = ($imageSize->getHeight() - $height) / 2;
                    break;
            }
        }

        return $image->crop(new Point($cropX, $cropY), new Box($width, $height));
    }
}
