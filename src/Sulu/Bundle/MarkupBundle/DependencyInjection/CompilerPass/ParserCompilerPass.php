<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MarkupBundle\DependencyInjection\CompilerPass;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Collects all parsers for markup.
 */
class ParserCompilerPass implements CompilerPassInterface
{
    public const SERVICE_ID = 'sulu_markup.response_listener';

    public const TAG_NAME = 'sulu_markup.parser';

    public const TYPE_ATTRIBUTE = 'type';

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition(self::SERVICE_ID)) {
            return;
        }

        $references = [];
        foreach ($container->findTaggedServiceIds(self::TAG_NAME) as $id => $tags) {
            foreach ($tags as $attributes) {
                $references[$attributes[self::TYPE_ATTRIBUTE]] = new Reference($id);
            }
        }

        if (0 === \count($references)) {
            return;
        }

        $container->getDefinition(self::SERVICE_ID)->replaceArgument(0, $references);
    }
}
