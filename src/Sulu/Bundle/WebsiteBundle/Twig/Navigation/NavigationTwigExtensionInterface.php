<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\WebsiteBundle\Twig\Navigation;

use Sulu\Bundle\WebsiteBundle\Navigation\NavigationItem;
use Twig\Extension\ExtensionInterface;

/**
 * provides the navigation function.
 */
interface NavigationTwigExtensionInterface extends ExtensionInterface
{
    /**
     * Returns a flat navigation of first layer.
     *
     * @param string $context
     * @param int $depth
     * @param bool $loadExcerpt
     *
     * @return NavigationItem[]
     */
    public function flatRootNavigationFunction($context = null, $depth = 1, $loadExcerpt = false);

    /**
     * Returns a tree navigation of first layer.
     *
     * @param string $context
     * @param int $depth
     * @param bool $loadExcerpt
     *
     * @return NavigationItem[]
     */
    public function treeRootNavigationFunction($context = null, $depth = 1, $loadExcerpt = false);

    /**
     * Returns a tree navigation of children from given parent (uuid).
     *
     * @param string $uuid
     * @param string $context
     * @param int $depth
     * @param bool $loadExcerpt
     * @param int $level
     *
     * @return NavigationItem[]
     */
    public function treeNavigationFunction($uuid, $context = null, $depth = 1, $loadExcerpt = false, $level = null);

    /**
     * Returns a flat navigation of children from given parent (uuid).
     *
     * @param string $uuid
     * @param string $context
     * @param int $depth
     * @param bool $loadExcerpt
     * @param int $level
     *
     * @return NavigationItem[]
     */
    public function flatNavigationFunction($uuid, $context = null, $depth = 1, $loadExcerpt = false, $level = null);

    /**
     * Returns breadcrumb for given node.
     *
     * @param string $uuid
     *
     * @return NavigationItem[]
     */
    public function breadcrumbFunction($uuid);

    /**
     * Returns a boolean value to check if navigation item is active.
     *
     * @param string $requestUrl
     * @param string $itemUrl
     *
     * @return NavigationItem[]
     */
    public function navigationIsActiveFunction($requestUrl, $itemUrl);
}
