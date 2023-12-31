<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Content;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * ContentTypeManager.
 *
 * Uses an alias => service ID map to fetch content types from
 * the dependency injection container.
 */
class ContentTypeManager implements ContentTypeManagerInterface
{
    /**
     * @var ContainerInterface
     */
    protected $container;

    /**
     * @var array
     */
    protected $aliasServiceIdMap = [];

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * Map a content type alias to a service ID.
     *
     * @param string $alias - Alias for content type, e.g. media
     * @param string $serviceId - ID of corresponding service in the DI container
     */
    public function mapAliasToServiceId($alias, $serviceId)
    {
        $this->aliasServiceIdMap[$alias] = $serviceId;
    }

    public function get($alias)
    {
        if (!isset($this->aliasServiceIdMap[$alias])) {
            throw new \InvalidArgumentException(\sprintf(
                'Content type with alias "%s" has not been registered. Known content types are: "%s"',
                $alias,
                \implode('", "', \array_keys($this->aliasServiceIdMap))
            ));
        }

        $serviceId = $this->aliasServiceIdMap[$alias];

        return $this->container->get($serviceId);
    }

    public function has($alias)
    {
        return isset($this->aliasServiceIdMap[$alias]);
    }

    public function getAll(): array
    {
        return \array_keys($this->aliasServiceIdMap);
    }
}
